# Compiler to use
CXX = g++
# Compiler flags
CXXFLAGS = -std=c++11 -Wall
# Target executable name
TARGET = system_monitor
# Source files
SOURCES = main.cpp system_stats.cpp
# Object files
OBJECTS = $(SOURCES:.cpp=.o)

# Default target
all: $(TARGET)

# Link object files to create the executable
$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET)

# Compile source files to object files
%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean up
clean:
	rm -f $(OBJECTS) $(TARGET)

.PHONY: all clean
