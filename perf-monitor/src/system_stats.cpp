#include "system_stats.hpp"
#include <fstream>
#include <sstream>
#include <thread>
#include <chrono>
#include <cmath>
#include <sys/statvfs.h>
#include <algorithm>
#include <iostream>

SystemStats::SystemStats() : prev_total_cpu(0), prev_idle_cpu(0) {
    update_cpu_measurements();
    update_disk_measurements();
    // Add initial delay to get accurate first measurement
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
}

SystemStats::~SystemStats() {}

CPUStats SystemStats::get_cpu_stats() {
    std::ifstream stat_file("/proc/stat");
    std::string line;
    CPUStats stats;

    if (!stat_file.is_open()) {
        std::cerr << "Error: Could not open /proc/stat\n";
        stats.usage_percent = 0.0; // Fallback value
        return stats;
    }

    // Get overall CPU usage
    if (std::getline(stat_file, line)) {
        std::istringstream iss(line);
        std::string cpu;
        unsigned long long user, nice, system, idle, iowait, irq, softirq, steal;

        iss >> cpu >> user >> nice >> system >> idle >> iowait >> irq >> softirq >> steal;

        std::cerr << "Debug: /proc/stat line: " << line << "\n";
        unsigned long long total = user + nice + system + idle + iowait + irq + softirq + steal;
        unsigned long long total_idle = idle + iowait;

        stats.usage_percent = calculate_cpu_usage(total, total_idle, prev_total_cpu, prev_idle_cpu);
        stats.usage_percent = std::min(100.0, std::max(0.0, stats.usage_percent));

        prev_total_cpu = total;
        prev_idle_cpu = total_idle;
    } else {
        std::cerr << "Error: Failed to read /proc/stat line\n";
    }

    // Get per-core usage
    stats.core_usage.clear();
    while (std::getline(stat_file, line)) {
        if (line.find("cpu") != 0) break;

        std::istringstream iss(line);
        std::string cpu;
        unsigned long long user, nice, system, idle, iowait, irq, softirq, steal;

        iss >> cpu >> user >> nice >> system >> idle >> iowait >> irq >> softirq >> steal;

        unsigned long long total = user + nice + system + idle + iowait + irq + softirq + steal;
        unsigned long long total_idle = idle + iowait;

        size_t core_idx = stats.core_usage.size();
        if (core_idx < prev_total_cores.size()) {
            double usage = calculate_cpu_usage(total, total_idle,
                                            prev_total_cores[core_idx],
                                            prev_idle_cores[core_idx]);
            usage = std::min(100.0, std::max(0.0, usage));
            stats.core_usage.push_back(usage);
        }

        if (core_idx >= prev_total_cores.size()) {
            prev_total_cores.push_back(total);
            prev_idle_cores.push_back(total_idle);
        } else {
            prev_total_cores[core_idx] = total;
            prev_idle_cores[core_idx] = total_idle;
        }
    }

    return stats ;
}
MemoryStats SystemStats::get_memory_stats() {
    std::ifstream meminfo("/proc/meminfo");
    std::string line;
    MemoryStats stats;
    unsigned long total = 0, free = 0, buffers = 0, cached = 0;

    if (!meminfo.is_open()) {
        std::cerr << "Error: Could not open /proc/meminfo\n";
        stats.total_mb = 0.0; // Fallback value
        return stats;
    }

    while (std::getline(meminfo, line)) {
        std::istringstream iss(line);
        std::string key;
        unsigned long value;
        std::string unit;

        iss >> key >> value >> unit;

        std::cerr << "Debug: /proc/meminfo line: " << line << "\n";
        if (key == "MemTotal:") total = value;
        else if (key == "MemFree:") free = value;
        else if (key == "Buffers:") buffers = value;
        else if (key == "Cached:") cached = value;
    }

    stats.total_mb = total / 1024.0;
    stats.free_mb = (free + buffers + cached) / 1024.0;
    stats.used_mb = stats.total_mb - stats.free_mb;
    stats.usage_percent = (stats.used_mb / stats.total_mb) * 100.0;
    stats.usage_percent = std::min(100.0, std::max(0.0, stats.usage_percent));

    return stats;
}

std::vector<DiskStats> SystemStats::get_disk_stats() {
    std::vector<DiskStats> stats;
    std::ifstream mounts("/proc/mounts");
    std::string line;
    
    while (std::getline(mounts, line)) {
        std::istringstream iss(line);
        std::string device, mount_point, fs_type;
        iss >> device >> mount_point >> fs_type;
        
        if (device.find("/dev/") == 0 && fs_type != "tmpfs") {
            struct statvfs fs_stats;
            if (statvfs(mount_point.c_str(), &fs_stats) == 0) {
                DiskStats disk;
                disk.device = device;
                
                unsigned long long block_size = fs_stats.f_frsize;
                disk.total_gb = (block_size * fs_stats.f_blocks) / (1024.0 * 1024 * 1024);
                disk.free_gb = (block_size * fs_stats.f_bfree) / (1024.0 * 1024 * 1024);
                disk.used_gb = disk.total_gb - disk.free_gb;
                disk.usage_percent = (disk.used_gb / disk.total_gb) * 100.0;
                disk.usage_percent = std::min(100.0, std::max(0.0, disk.usage_percent));
                
                stats.push_back(disk);
            }
        }
    }
    
    // Get disk I/O stats
    std::ifstream diskstats("/proc/diskstats");
    size_t disk_idx = 0;
    
    while (std::getline(diskstats, line) && disk_idx < stats.size()) {
        std::istringstream iss(line);
        std::string dev_name;
        unsigned long long reads, writes;
        
        // Skip first three fields
        iss >> dev_name >> dev_name >> dev_name;
        iss >> reads;
        // Skip next 4 fields
        iss >> dev_name >> dev_name >> dev_name >> dev_name;
        iss >> writes;
        
        if (disk_idx < prev_disk_io.size()) {
            double read_delta = reads - prev_disk_io[disk_idx].reads;
            double write_delta = writes - prev_disk_io[disk_idx].writes;
            
            stats[disk_idx].read_mbps = std::max(0.0, (read_delta * 512.0) / (1024 * 1024));
            stats[disk_idx].write_mbps = std::max(0.0, (write_delta * 512.0) / (1024 * 1024));
        }
        
        if (disk_idx >= prev_disk_io.size()) {
            DiskIO io = {reads, writes};
            prev_disk_io.push_back(io);
        } else {
            prev_disk_io[disk_idx].reads = reads;
            prev_disk_io[disk_idx].writes = writes;
        }
        
        disk_idx++;
    }
    
    return stats;
}

void SystemStats::update_cpu_measurements() {
    std::ifstream stat_file("/proc/stat");
    std::string line;
    
    if (std::getline(stat_file, line)) {
        std::istringstream iss(line);
        std::string cpu;
        unsigned long long user, nice, system, idle, iowait, irq, softirq, steal;
        
        iss >> cpu >> user >> nice >> system >> idle >> iowait >> irq >> softirq >> steal;
        
        prev_total_cpu = user + nice + system + idle + iowait + irq + softirq + steal;
        prev_idle_cpu = idle + iowait;
    }
}

void SystemStats::update_disk_measurements() {
    std::ifstream diskstats("/proc/diskstats");
    std::string line;
    prev_disk_io.clear();
    
    while (std::getline(diskstats, line)) {
        std::istringstream iss(line);
        std::string dev_name;
        unsigned long long reads, writes;
        
        iss >> dev_name >> dev_name >> dev_name >> reads;
        // Skip next 4 fields
        iss >> dev_name >> dev_name >> dev_name >> dev_name >> writes;
        
        DiskIO io = {reads, writes};
        prev_disk_io.push_back(io);
    }
}

double SystemStats::calculate_cpu_usage(unsigned long long total, unsigned long long idle,
                                     unsigned long long prev_total, unsigned long long prev_idle) {
    double total_delta = total - prev_total;
    double idle_delta = idle - prev_idle;
    
    if (total_delta <= 0) return 0.0;
    
    return std::min(100.0, std::max(0.0, 100.0 * (1.0 - idle_delta / total_delta)));
} 
