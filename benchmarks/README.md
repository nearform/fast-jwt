# Benchmarks

## Signing

```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (sync)                     3.40 µs/iter   2.83 µs  █                   
                                 (2.54 µs … 2.92 ms)   7.04 µs  █                   
                             (512.00  b …   1.03 mb)   2.98 kb ▅█▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)           215.96 µs/iter 216.17 µs  ▇█                  
                               (206.42 µs … 1.45 ms) 255.54 µs  ██▄                 
                             (  5.55 kb … 873.49 kb)   8.90 kb ▂███▇▄▃▃▃▃▂▂▂▂▁▂▁▁▁▁▁

HS512 - jsonwebtoken (async)          216.60 µs/iter 218.17 µs   ▆█▃▅               
                             (204.21 µs … 378.63 µs) 258.29 µs   ████               
                             (  8.85 kb … 694.75 kb)  13.55 kb ▂▆█████▄▃▃▂▂▂▂▂▂▂▁▁▁▁

HS512 - fast-jwt (sync)                 2.28 µs/iter   2.41 µs ▂█            ▂      
                                 (2.13 µs … 2.54 µs)   2.54 µs ██           ▅█      
                             (  1.57 kb …   1.57 kb)   1.57 kb ██▅▂▄█▅▁▁▁▁▁▁██▄▂▁▁▅▄

HS512 - fast-jwt (async)                3.91 µs/iter   3.92 µs        █             
                                 (3.80 µs … 4.22 µs)   4.07 µs    █ █ ███           
                             (113.49  b …   3.61 kb) 643.65  b ▅███▁███████▁▅▅█▁▅▁▁▅

HS512 - @node-rs/jsonwebtoken (sync)    2.82 µs/iter   2.83 µs   █                  
                                 (2.79 µs … 2.86 µs)   2.86 µs   █▂▂▂▅ ▂▇▂▅  ▂      
                             (  1.31 kb …   1.31 kb)   1.31 kb ▄▇█████▇████▇▇█▇▄▇▄▄▄

HS512 - @node-rs/jsonwebtoken (async)  12.41 µs/iter  12.41 µs    █        █        
                               (12.36 µs … 12.49 µs)  12.43 µs ▅  █        █  ▅▅▅  ▅
                             (  2.20 kb …   2.32 kb)   2.23 kb █▁▁█▁▁▁▁▁▁▁▁█▁▁███▁▁█

summary
  HS512 - fast-jwt (sync)
   1.24x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.5x faster than HS512 - jose (sync)
   1.72x faster than HS512 - fast-jwt (async)
   5.45x faster than HS512 - @node-rs/jsonwebtoken (async)
   94.87x faster than HS512 - jsonwebtoken (sync)
   95.16x faster than HS512 - jsonwebtoken (async)
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
ES512 - jose (sync)                     1.19 ms/iter   1.19 ms         ▃█           
                                 (1.10 ms … 1.40 ms)   1.29 ms         ██           
                             (  3.27 kb …   1.32 mb)   9.44 kb ▂▁▁▁▁▁▁▁██▆▃▃▃▁▁▂▁▁▁▁

ES512 - jsonwebtoken (sync)             1.44 ms/iter   1.44 ms       █▆             
                                 (1.37 ms … 1.75 ms)   1.57 ms       ██             
                             (  6.36 kb …  55.21 kb)   7.81 kb ▂▁▆█▆▆██▇▃▄▄▂▂▂▁▂▂▁▁▁

ES512 - jsonwebtoken (async)            1.47 ms/iter   1.48 ms                █     
                                 (1.38 ms … 1.58 ms)   1.50 ms               ▃██    
                             (  9.82 kb … 701.87 kb)  14.89 kb ▁▂▁▁▁▁▁▁▁▄▄▂▂▂███▇▄▂▁

ES512 - fast-jwt (sync)                 1.19 ms/iter   1.21 ms    █ ▆▄              
                                 (1.10 ms … 1.45 ms)   1.39 ms   ▂████              
                             (  2.34 kb …   1.00 mb)   6.21 kb ▄██████▅▄▄▄▄▆▆▃▃▄▃▂▂▁

ES512 - fast-jwt (async)                1.45 ms/iter   1.45 ms         █            
                                 (1.37 ms … 1.83 ms)   1.55 ms         █▃           
                             (  5.09 kb …   1.27 mb)   8.42 kb ▁▁▁▁▂▂▂▅██▄▁▁▁▁▁▁▂▁▁▁

ES512 - @node-rs/jsonwebtoken (sync)    2.47 µs/iter   2.48 µs  █ █                 
                                 (2.44 µs … 2.59 µs)   2.59 µs █████                
                             (  1.27 kb …   1.27 kb)   1.27 kb ██████▇▅█▁▁▁▁▅▁▁▁▁▁▁▅

ES512 - @node-rs/jsonwebtoken (async)   9.38 µs/iter   9.39 µs         █            
                                 (9.23 µs … 9.68 µs)   9.60 µs    ▂    █            
                             (  2.17 kb …   2.27 kb)   2.19 kb ▆▆▁█▁▆▆▁█▆▁▆▁▁▁▁▁▁▁▁▆

summary
  ES512 - @node-rs/jsonwebtoken (sync)
   3.79x faster than ES512 - @node-rs/jsonwebtoken (async)
   480.99x faster than ES512 - jose (sync)
   482.05x faster than ES512 - fast-jwt (sync)
   581.62x faster than ES512 - jsonwebtoken (sync)
   586.21x faster than ES512 - fast-jwt (async)
   593.4x faster than ES512 - jsonwebtoken (async)
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (sync)                     2.70 ms/iter   2.71 ms     █                
                                 (2.53 ms … 3.33 ms)   3.31 ms     █▄               
                             (  4.82 kb …  13.74 kb)   4.91 kb ▄▃▂▃██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - jsonwebtoken (sync)             3.55 ms/iter   3.57 ms               █▂     
                                 (3.39 ms … 3.65 ms)   3.63 ms               ██     
                             (  8.88 kb …  16.13 kb)   9.20 kb ▂▂▃▂▁▁▁▁▁▁▁▁▂███▆▇▃▂▁

RS512 - jsonwebtoken (async)            3.46 ms/iter   3.44 ms  █                   
                                 (3.37 ms … 4.09 ms)   3.85 ms ▃█▂                  
                             ( 12.81 kb …  61.19 kb)  13.59 kb ███▃▂▂▂▁▂▂▁▂▂▃▂▂▂▂▂▁▂

RS512 - fast-jwt (sync)                 2.72 ms/iter   2.71 ms   █                  
                                 (2.64 ms … 3.30 ms)   3.28 ms   █                  
                             (  4.41 kb …  52.62 kb)   4.63 kb ▂▄█▄▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)                3.55 ms/iter   3.59 ms              ▆▇▅█▅   
                                 (3.37 ms … 3.64 ms)   3.63 ms              █████   
                             (  9.77 kb …  16.04 kb)  10.00 kb ▂▆▄▂▂▃▂▁▁▁▂▁▄█████▆▂▂

RS512 - @node-rs/jsonwebtoken (sync)    2.44 ms/iter   2.44 ms  ▇█                  
                                 (2.42 ms … 2.50 ms)   2.48 ms  ██▅▃                
                             (  2.02 kb …   2.28 kb)   2.03 kb ▇█████▆▇▆▃▂▄▂▂▁▂▁▁▁▁▁

RS512 - @node-rs/jsonwebtoken (async)   2.46 ms/iter   2.46 ms █▂                   
                                 (2.44 ms … 2.63 ms)   2.62 ms ██▆                  
                             (  3.05 kb …   3.11 kb)   3.06 kb ███▃▂▂▂▁▁▁▁▁▁▁▂▁▁▁▁▁▁

summary
  RS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than RS512 - @node-rs/jsonwebtoken (async)
   1.11x faster than RS512 - jose (sync)
   1.12x faster than RS512 - fast-jwt (sync)
   1.42x faster than RS512 - jsonwebtoken (async)
   1.46x faster than RS512 - jsonwebtoken (sync)
   1.46x faster than RS512 - fast-jwt (async)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (sync)                     2.57 ms/iter   2.58 ms ▃█▃                  
                                 (2.52 ms … 3.16 ms)   3.14 ms ███                  
                             (  4.91 kb …   5.84 kb)   4.95 kb ███▄▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

PS512 - jsonwebtoken (sync)             3.56 ms/iter   3.58 ms                  █▅  
                                 (3.38 ms … 3.61 ms)   3.61 ms               ▆█▅██▆ 
                             (  8.01 kb …  10.53 kb)   8.95 kb ▂▃▁▂▂▄▂▁▂▁▂▁▂▂██████▄

PS512 - jsonwebtoken (async)            3.58 ms/iter   3.60 ms                █     
                                 (3.38 ms … 3.66 ms)   3.65 ms                ██▂   
                             ( 11.87 kb …  61.14 kb)  13.99 kb ▁▃▂▁▁▁▁▁▁▁▁▁▃▅█████▄▂

PS512 - fast-jwt (sync)                 2.56 ms/iter   2.57 ms ██                   
                                 (2.52 ms … 3.18 ms)   3.14 ms ██▆                  
                             (  3.75 kb …  45.22 kb)   4.59 kb ███▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▁

PS512 - fast-jwt (async)                3.47 ms/iter   3.46 ms  █                   
                                 (3.35 ms … 3.95 ms)   3.88 ms  █▃▆                 
                             (  9.08 kb …   1.19 mb)  15.77 kb ▄████▃▃▁▂▁▃▂▃▂▁▁▂▁▂▂▂

PS512 - @node-rs/jsonwebtoken (sync)    2.51 ms/iter   2.61 ms ▅█▄              ▅   
                                 (2.43 ms … 2.64 ms)   2.64 ms ███    ▅         ██  
                             (  2.02 kb …   2.28 kb)   2.03 kb ███▆▅▆▄█▃▂▂▁▂▁▁▁▁███▃

PS512 - @node-rs/jsonwebtoken (async)   2.48 ms/iter   2.47 ms  █                   
                                 (2.44 ms … 2.64 ms)   2.63 ms  █▃                  
                             (  3.05 kb …   3.11 kb)   3.06 kb ▇██▅▄▂▁▁▂▁▁▁▂▂▁▁▂▂▂▂▂

summary
  PS512 - @node-rs/jsonwebtoken (async)
   1.01x faster than PS512 - @node-rs/jsonwebtoken (sync)
   1.04x faster than PS512 - fast-jwt (sync)
   1.04x faster than PS512 - jose (sync)
   1.4x faster than PS512 - fast-jwt (async)
   1.44x faster than PS512 - jsonwebtoken (sync)
   1.45x faster than PS512 - jsonwebtoken (async)
clk: ~3.78 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (sync)                    25.36 µs/iter  25.34 µs              ██      
                               (24.75 µs … 26.76 µs)  25.55 µs █            ██      
                             (  3.14 kb …   3.14 kb)   3.14 kb █▁▁▁▁▁▁▁▁▁▁▁▁███▁█▁▁█

EdDSA - fast-jwt (sync)                24.98 µs/iter  25.22 µs  █                 █ 
                               (24.41 µs … 26.73 µs)  25.25 µs ██                 ██
                             (  1.89 kb …   1.89 kb)   1.89 kb ██▁▁▁▁▁█▁▁▁▁▁▁▁▁▁▁▁██

EdDSA - fast-jwt (async)              255.10 µs/iter 256.00 µs    █▂                
                             (247.00 µs … 308.17 µs) 280.63 µs    ██▆               
                             (  3.98 kb … 954.75 kb)   6.47 kb ▁▁▅████▄▃▂▂▂▂▁▂▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)    2.55 µs/iter   2.56 µs   ▂  █▂    ▂         
                                 (2.52 µs … 2.59 µs)   2.59 µs ▂ █▂▇██▅▅▅ █  ▇      
                             (  1.27 kb …   1.27 kb)   1.27 kb █▄████████▇█▄▄█▇▁▄▁▁▄

EdDSA - @node-rs/jsonwebtoken (async)   9.11 µs/iter   9.12 µs ██                   
                                 (9.01 µs … 9.55 µs)   9.33 µs ██ █                 
                             (  2.17 kb …   2.27 kb)   2.19 kb █████▁▁█▁█▁█▁▁▁▁▁▁▁▁█

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   3.58x faster than EdDSA - @node-rs/jsonwebtoken (async)
   9.81x faster than EdDSA - fast-jwt (sync)
   9.96x faster than EdDSA - jose (sync)
   100.23x faster than EdDSA - fast-jwt (async)
```

## Decoding

```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                911.39 ns/iter 915.29 ns   ▄█▃                
                       (890.21 ns … 991.58 ns) 982.05 ns   ███▂               
                       (260.37  b … 458.22  b) 456.86  b ▂▆█████▅▆▂▃▃▂▁▁▂▁▂▁▂▂

RS512 - fast-jwt (complete)     963.04 ns/iter 967.82 ns             █▅       
                       (916.03 ns … 992.09 ns) 988.75 ns             ██▃      
                       (362.40  b … 578.25  b) 576.66  b ▂▂▂▂▂▂▂▂▂▂▃████▇▂▃▅▅▄

RS512 - jsonwebtoken              1.60 µs/iter   1.60 µs    █▅▄               
                           (1.55 µs … 1.70 µs)   1.70 µs  ▅▇███▅              
                       (857.28  b … 867.15  b) 866.93  b ▄██████▅▆▁▁▁▂▅▅▆▂▁▂▅▅

RS512 - jsonwebtoken (complete)   1.64 µs/iter   1.65 µs            ▃ █       
                           (1.58 µs … 1.68 µs)   1.67 µs            ███ ▂     
                       (858.64  b … 891.15  b) 873.72  b ▃▁▁▁▂▁▁▄▁▃▄█████▂▄▅▆▄

RS512 - jose                    742.98 ns/iter 750.80 ns           ▃█▇▃       
                       (691.49 ns … 784.89 ns) 774.26 ns           ████▇▃     
                       (426.12  b … 440.21  b) 435.61  b ▂▂▂▁▄▁▂▂▃█████████▅▄▃

RS512 - jose (complete)         723.30 ns/iter 729.87 ns      ▃     ▇█        
                       (698.66 ns … 757.27 ns) 749.85 ns     ▅██▇▅ ▅██▆       
                       (414.52  b … 446.12  b) 439.71  b ▂▁▃▆██████████▅▆▃▃▆▃▃

summary
  RS512 - jose (complete)
   1.03x faster than RS512 - jose
   1.26x faster than RS512 - fast-jwt
   1.33x faster than RS512 - fast-jwt (complete)
   2.21x faster than RS512 - jsonwebtoken
   2.27x faster than RS512 - jsonwebtoken (complete)
```

Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying

```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)               2.99 µs/iter   3.83 µs █                    
                               (2.51 µs … 4.08 µs)   4.08 µs █▃                   
                           (  1.26 kb …   1.26 kb)   1.26 kb ██▁▂▄▁▁▁▁▁▁▁▁▁▁▁▁▆▁▄█

HS512 - fast-jwt (async)              5.51 µs/iter   5.58 µs   █                  
                               (5.37 µs … 5.78 µs)   5.77 µs  ▃█                  
                           (197.31  b …   1.16 kb) 944.07  b ███▁███▁▄▁▄▄▁█▁▁▄█▁▁▄

HS512 - fast-jwt (sync with cache)    1.12 µs/iter 928.33 ns █                    
                             (871.23 ns … 2.25 µs)   2.21 µs █▅                   
                           (494.20  b …   1.24 kb) 715.74  b ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▆▃

HS512 - fast-jwt (async with cache)   1.22 µs/iter   1.57 µs █                    
                             (969.98 ns … 1.81 µs)   1.74 µs █▃              ▆    
                           (  1.37 kb …   2.06 kb)   1.47 kb ██▁▄▁▁▁▁▁▁▁▁▁▁▁▇█▂▁▁▂

HS512 - jose (sync)                   3.50 µs/iter   3.86 µs                   █  
                               (3.00 µs … 3.95 µs)   3.93 µs ▅█                █  
                           (  2.14 kb …   2.14 kb)   2.14 kb ██▁▃▃▁▁▁▁▁▁▁▁▁▁▁▁▃██▆

HS512 - jsonwebtoken (sync)         225.02 µs/iter 226.13 µs   █                  
                           (215.00 µs … 426.25 µs) 259.71 µs  ██▇▅                
                           (  5.43 kb …   1.06 mb)   8.96 kb ▁████▇▄▃▃▄▃▃▂▂▂▂▂▁▁▁▁

HS512 - jsonwebtoken (async)        218.92 µs/iter 219.33 µs   █                  
                           (213.17 µs … 321.21 µs) 245.29 µs   █                  
                           (  6.11 kb … 647.65 kb)   6.75 kb ▁▄███▄▂▂▁▁▁▂▂▁▁▁▁▁▁▁▁

summary
  HS512 - fast-jwt (sync with cache)
   1.09x faster than HS512 - fast-jwt (async with cache)
   2.66x faster than HS512 - fast-jwt (sync)
   3.11x faster than HS512 - jose (sync)
   4.9x faster than HS512 - fast-jwt (async)
   194.64x faster than HS512 - jsonwebtoken (async)
   200.06x faster than HS512 - jsonwebtoken (sync)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)             903.15 µs/iter 903.88 µs        █             
                             (835.71 µs … 1.09 ms)   1.01 ms        █▄            
                           (  2.14 kb … 526.16 kb)   3.05 kb ▁▁▁▁▁▁▁██▃▂▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async)            980.26 µs/iter 982.83 µs            █         
                             (908.63 µs … 1.18 ms)   1.03 ms            ██        
                           (  4.25 kb … 985.26 kb)   9.04 kb ▁▂▁▁▁▁▁▂▁▁▁██▆▃▂▂▂▂▁▁

ES512 - fast-jwt (sync with cache)    1.23 µs/iter   1.13 µs      █               
                             (916.00 ns … 3.81 ms)   1.63 µs     ▂█▅              
                           (752.00  b … 196.98 kb) 805.96  b ▁▂▅▁███▄▂▂▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.36 µs/iter   1.13 µs    █▇                
                            (1000.00 ns … 1.80 ms)   1.63 µs    ██                
                           (  1.45 kb … 161.47 kb)   1.81 kb ▁▄▁███▁▃▂▂▁▁▁▁▁▁▁▁▁▁▁

ES512 - jose (sync)                 900.33 µs/iter 902.67 µs           █          
                             (842.17 µs … 1.03 ms) 951.21 µs           █▆         
                           (  2.40 kb … 851.02 kb)   4.16 kb ▁▁▁▁▁▁▁▁▁▂██▆▃▂▁▁▁▁▁▁

ES512 - jsonwebtoken (sync)         994.51 µs/iter 998.13 µs              ▃█      
                             (935.75 µs … 1.04 ms)   1.02 ms              ██▆     
                           (  4.50 kb … 917.00 kb)   6.13 kb ▁▁▁▁▁▂▂▂▁▁▁▁▃███▆▄▂▂▂

ES512 - jsonwebtoken (async)        996.33 µs/iter 999.83 µs            █         
                             (924.92 µs … 1.09 ms)   1.05 ms            █▄        
                           (  5.04 kb …   1.30 mb)   9.58 kb ▁▁▁▁▁▁▁▁▁▁▇██▅▃▃▃▂▁▁▁

summary
  ES512 - fast-jwt (sync with cache)
   1.1x faster than ES512 - fast-jwt (async with cache)
   730.41x faster than ES512 - jose (sync)
   732.71x faster than ES512 - fast-jwt (sync)
   795.26x faster than ES512 - fast-jwt (async)
   806.83x faster than ES512 - jsonwebtoken (sync)
   808.3x faster than ES512 - jsonwebtoken (async)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)              44.26 µs/iter  44.86 µs               █  █   
                             (42.39 µs … 46.19 µs)  45.31 µs ▅ ▅  ▅   ▅  ▅ █  █ ▅▅
                           (  1.72 kb …   1.72 kb)   1.72 kb █▁█▁▁█▁▁▁█▁▁█▁█▁▁█▁██

RS512 - fast-jwt (async)            126.47 µs/iter 130.83 µs   █                  
                           (119.71 µs … 212.33 µs) 141.33 µs  ██▃      █▅         
                           (  4.32 kb … 481.60 kb)   5.58 kb ▂███▅▄▂▂▂███▅▃▂▂▂▁▁▁▁

RS512 - fast-jwt (sync with cache)    1.53 µs/iter   1.32 µs █                    
                               (1.27 µs … 2.71 µs)   2.66 µs █                    
                           (711.98  b … 721.63  b) 721.37  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▅▃

RS512 - fast-jwt (async with cache)   1.69 µs/iter   2.03 µs  █              ▂    
                               (1.38 µs … 2.21 µs)   2.19 µs  █▆▄            █    
                           (  1.38 kb …   1.48 kb)   1.47 kb ████▁▁▂▁▁▁▁▁▁▁▁▄█▂▄▆▅

RS512 - jose (sync)                  46.03 µs/iter  46.33 µs     █                
                            (41.79 µs … 912.33 µs)  57.46 µs     ██               
                           (  2.30 kb … 403.32 kb)   3.25 kb ▄▇▇▃███▄▄▃▂▂▂▂▂▂▂▁▁▁▁

RS512 - jsonwebtoken (sync)         130.85 µs/iter 134.96 µs  █    ▂              
                           (120.58 µs … 950.04 µs) 156.00 µs  ██▅  █▃             
                           (  8.24 kb … 736.30 kb)   9.85 kb ▃███▇▆████▇▅▄▃▂▂▂▂▂▁▁

RS512 - jsonwebtoken (async)        130.70 µs/iter 135.04 µs  █                   
                             (119.92 µs … 2.22 ms) 158.00 µs  █▇   ▆              
                           (  8.78 kb … 145.44 kb)   8.94 kb ▄███▆▇████▆▄▃▃▂▂▂▂▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   1.1x faster than RS512 - fast-jwt (async with cache)
   28.88x faster than RS512 - fast-jwt (sync)
   30.04x faster than RS512 - jose (sync)
   82.54x faster than RS512 - fast-jwt (async)
   85.3x faster than RS512 - jsonwebtoken (async)
   85.4x faster than RS512 - jsonwebtoken (sync)
clk: ~3.79 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)              46.70 µs/iter  46.94 µs              █       
                             (45.46 µs … 48.41 µs)  47.57 µs ▅ ▅ ▅   ▅▅  ▅█▅    ▅▅
                           (  1.68 kb …   1.68 kb)   1.68 kb █▁█▁█▁▁▁██▁▁███▁▁▁▁██

PS512 - fast-jwt (async)             76.25 µs/iter  76.79 µs      █▆              
                              (69.54 µs … 1.03 ms)  93.00 µs  ▂   ██              
                           (  4.24 kb … 405.16 kb)   5.30 kb ▃█▅▃▂██▆▄▃▂▂▂▂▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)    1.47 µs/iter   1.32 µs █                    
                               (1.18 µs … 2.76 µs)   2.71 µs █▇                   
                           (703.48  b … 713.17  b) 712.92  b ██▅▃▁▁▁▁▁▁▁▁▁▁▁▁▁▄▃▂▃

PS512 - fast-jwt (async with cache)   1.63 µs/iter   2.00 µs █▅                   
                               (1.37 µs … 2.20 µs)   2.14 µs ██               █   
                           (  1.37 kb …   1.47 kb)   1.46 kb ██▅▂▁▁▁▁▁▁▁▁▁▁▁▁▇█▄▂▂

PS512 - jose (sync)                  46.12 µs/iter  47.17 µs  █   ▄               
                            (43.38 µs … 145.63 µs)  57.38 µs ▃█▂  █▂              
                           (800.00  b … 355.27 kb)   3.31 kb ███▅▃██▄▂▂▂▂▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)          77.11 µs/iter  78.04 µs     █                
                              (69.13 µs … 3.15 ms)  99.17 µs  ▇▂ █▅               
                           (  8.17 kb … 515.30 kb)   9.42 kb ▅██▄███▆▄▄▃▃▂▂▂▁▁▁▁▁▁

PS512 - jsonwebtoken (async)         74.75 µs/iter  75.71 µs  █                   
                              (69.25 µs … 3.03 ms)  88.79 µs  █▄   █▄             
                           (  8.68 kb … 426.21 kb)   9.20 kb ▄██▄▃▃██▄▃▂▂▂▁▂▁▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   1.11x faster than PS512 - fast-jwt (async with cache)
   31.29x faster than PS512 - jose (sync)
   31.69x faster than PS512 - fast-jwt (sync)
   50.72x faster than PS512 - jsonwebtoken (async)
   51.74x faster than PS512 - fast-jwt (async)
   52.32x faster than PS512 - jsonwebtoken (sync)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)              67.83 µs/iter  67.71 µs ██                   
                             (65.88 µs … 98.29 µs)  82.04 µs ██                   
                           (  1.55 kb … 389.55 kb)   2.22 kb ██▇▄▄▂▂▁▁▁▃▂▁▁▁▁▂▁▁▁▁

EdDSA - fast-jwt (async)            113.18 µs/iter 116.50 µs  █                   
                           (106.92 µs … 328.96 µs) 140.08 µs  █    █              
                           (  3.52 kb … 421.80 kb)   4.41 kb ▄█▇▄▂██▄▃▂▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)    1.26 µs/iter   1.05 µs █                    
                             (990.07 ns … 2.21 µs)   2.15 µs █                    
                           (880.85  b … 890.36  b) 890.20  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▅▅

EdDSA - fast-jwt (async with cache)   1.28 µs/iter   1.55 µs ▂█                   
                               (1.04 µs … 1.82 µs)   1.79 µs ██           ▅█      
                           (  1.53 kb …   1.65 kb)   1.64 kb ██▁▃▅▁▁▁▁▁▁▁▁██▃▁▂▁▁▂

EdDSA - jose (sync)                  67.16 µs/iter  67.04 µs  █                   
                            (66.17 µs … 105.38 µs)  77.50 µs  █                   
                           (  2.03 kb … 442.41 kb)   3.02 kb ▆█▆▂▁▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.02x faster than EdDSA - fast-jwt (async with cache)
   53.46x faster than EdDSA - jose (sync)
   53.99x faster than EdDSA - fast-jwt (sync)
   90.09x faster than EdDSA - fast-jwt (async)
```
