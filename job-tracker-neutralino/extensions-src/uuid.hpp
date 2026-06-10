#ifndef UUID_H_
#define UUID_H_

#include <random>
#include <string>

inline std::string getUUID() {
  static std::random_device dev;
  static std::mt19937 rng(dev());
  std::uniform_int_distribution<int> dist(0, 15);
  const char* hex = "0123456789abcdef";
  const bool dash[] = {0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0};

  std::string res;
  for (int i = 0; i < 16; i++) {
    if (dash[i]) res += "-";
    res += hex[dist(rng)];
    res += hex[dist(rng)];
  }
  return res;
}

#endif
