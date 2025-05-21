#ifndef SYSTEM_STATS_HPP
#define SYSTEM_STATS_HPP

#include <vector>
#include <string>
#include <cstddef>

struct CPUStats {
    double usage_percent;
    std::vector<double> core_usage;
};

struct MemoryStats {
    double total_mb;
    double free_mb;
    double used_mb;
    double usage_percent;
};

struct DiskStats {
    std::string device;
    double total_gb;
    double free_gb;
    double used_gb;
    double usage_percent;
    double read_mbps;
    double write_mbps;
};

struct DiskIO {
    unsigned long long reads;
    unsigned long long writes;
};

class SystemStats {
private:
    unsigned long long prev_total_cpu;
    unsigned long long prev_idle_cpu;
    std::vector<unsigned long long> prev_total_cores;
    std::vector<unsigned long long> prev_idle_cores;
    std::vector<DiskIO> prev_disk_io;

    void update_cpu_measurements();
    void update_disk_measurements();
    double calculate_cpu_usage(unsigned long long total, unsigned long long idle,
                             unsigned long long prev_total, unsigned long long prev_idle);

public:
    SystemStats();
    ~SystemStats();

    CPUStats get_cpu_stats();
    MemoryStats get_memory_stats();
    std::vector<DiskStats> get_disk_stats();
};

#endif // SYSTEM_STATS_HPP
