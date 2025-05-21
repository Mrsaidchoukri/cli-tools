// main.cpp
#include "system_stats.hpp"
#include <iostream>
#include <unistd.h> // pour sleep()

int main() {
    SystemStats monitor;
    
    while (true) {
        auto cpu = monitor.get_cpu_stats();
        auto memory = monitor.get_memory_stats();
        auto disks = monitor.get_disk_stats();

        std::cout << "CPU Usage: " << cpu.usage_percent << "%\n";
        std::cout << "Memory Usage: " << memory.usage_percent << "%\n";
        
        for (const auto& disk : disks) {
            std::cout << "Disk " << disk.device << ": " << disk.usage_percent << "% used\n";
        }
        
        sleep(1); // Rafraîchissement chaque seconde
    }
    
    return 0;
}

