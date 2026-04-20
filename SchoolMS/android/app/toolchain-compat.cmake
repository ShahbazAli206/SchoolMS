# Polyfill std::format for NDK 27 which ships C++20 support without std::format
# This is injected via force-include so it applies to every .cpp translation unit.
set(COMPAT_HEADER "${CMAKE_CURRENT_LIST_DIR}/format_compat.h")

file(WRITE "${COMPAT_HEADER}" [[
#pragma once
#if __cplusplus >= 202002L
#include <cstdio>
#include <string>
namespace std {
  // Only define if std::format is not already provided
  #ifndef __cpp_lib_format
  template<typename... Args>
  inline std::string format(const char* fmt, Args... args) {
    char buf[512];
    snprintf(buf, sizeof(buf), fmt, args...);
    return std::string(buf);
  }
  #endif
}
#endif
]])

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -include \"${COMPAT_HEADER}\"")
