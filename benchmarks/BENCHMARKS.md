# Benchmarks

## Signing

```
clk: ~3.80 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (sync)                     3.29 µs/iter   2.71 µs █                    
                                 (2.50 µs … 2.65 ms)   9.92 µs █▃                   
                             (  0.00  b …   1.14 mb)   2.98 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)           206.55 µs/iter 206.54 µs  █                   
                             (200.54 µs … 961.33 µs) 240.04 µs  █▇▃                 
                             (  6.11 kb … 874.05 kb)   9.29 kb ████▆▃▃▃▃▂▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (async)          235.51 µs/iter 236.13 µs   █                  
                               (223.42 µs … 1.68 ms) 283.25 µs  ███▃                
                             ( 12.14 kb …   0.98 mb)  18.22 kb ▂████▇▄▃▂▂▂▁▂▂▂▁▁▁▁▁▁

HS512 - fast-jwt (sync)                 2.39 µs/iter   2.50 µs  █                   
                                 (2.26 µs … 2.79 µs)   2.66 µs  █▅        ▂▇        
                             (  1.57 kb …   1.57 kb)   1.57 kb ▆██▄▄▄▅▂▄▁▁██▅▅▁▁▁▁▁▄

HS512 - fast-jwt (async)               29.48 µs/iter  29.50 µs       █              
                               (27.88 µs … 32.48 µs)  30.93 µs       █    █         
                             ( 89.69  b …   3.89 kb)   1.64 kb █▁▁▁█▁█▁█▁██▁▁█▁▁▁▁▁█

HS512 - @node-rs/jsonwebtoken (sync)    2.81 µs/iter   2.83 µs        █             
                                (2.63 µs … 81.50 µs)   3.13 µs      ▇ █▆            
                             (  1.34 kb … 129.41 kb)   1.38 kb ▁▁▁▃▁█▁██▁▅▁▂▁▁▁▁▁▁▁▁

HS512 - @node-rs/jsonwebtoken (async)  20.82 µs/iter  21.06 µs  █                   
                               (20.26 µs … 23.63 µs)  21.10 µs  █                  █
                             (  1.44 kb …   1.59 kb)   1.51 kb █████▁▁█▁▁▁▁▁▁▁▁▁▁▁██

summary
  HS512 - fast-jwt (sync)
   1.18x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.38x faster than HS512 - jose (sync)
   8.7x faster than HS512 - @node-rs/jsonwebtoken (async)
   12.33x faster than HS512 - fast-jwt (async)
   86.37x faster than HS512 - jsonwebtoken (sync)
   98.48x faster than HS512 - jsonwebtoken (async)
clk: ~3.78 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
ES512 - jose (sync)                     1.18 ms/iter   1.20 ms          █    ▃▇     
                                 (1.12 ms … 1.31 ms)   1.23 ms        ▂██▇  ▂██▂    
                             (  3.88 kb … 747.25 kb)   7.61 kb ▂▂▃▃▆▅▇██████████▆▂▁▁

ES512 - jsonwebtoken (sync)             1.44 ms/iter   1.45 ms            ██        
                                 (1.38 ms … 1.54 ms)   1.48 ms           ▄██▃       
                             (  6.29 kb …  55.69 kb)   7.79 kb ▁▁▃▅█▅▅▄▃▄████▇▃▂▅▅▄▁

ES512 - jsonwebtoken (async)            1.44 ms/iter   1.46 ms      ▄█              
                                 (1.39 ms … 1.58 ms)   1.52 ms     ▂██▆   ▃         
                             ( 11.80 kb … 936.15 kb)  17.41 kb ▂▄▄▆█████▄███▃▂▄▅▆▂▂▂

ES512 - fast-jwt (sync)                 1.19 ms/iter   1.20 ms         █            
                                 (1.11 ms … 1.39 ms)   1.32 ms         █            
                             (  2.74 kb … 224.46 kb)   4.35 kb ▄▄▄▄▄▅▄▅██▄▃▄▃▂▂▂▂▂▁▁

ES512 - fast-jwt (async)                1.44 ms/iter   1.45 ms      █▃  ▇▆          
                                 (1.38 ms … 1.75 ms)   1.52 ms     ▃██▂▂██▇         
                             (  7.84 kb … 841.70 kb)  10.81 kb ▃▂▃▆████████▇▄██▄▂▂▁▁

ES512 - @node-rs/jsonwebtoken (sync)    2.43 µs/iter   2.44 µs      █               
                                 (2.39 µs … 2.52 µs)   2.51 µs     ██ ▄             
                             (  1.27 kb …   1.27 kb)   1.27 kb ▃▁▃▇██▇█▅▂▃▃▁▁▃▂▁▁▁▁▂

ES512 - @node-rs/jsonwebtoken (async)  18.83 µs/iter  17.50 µs     █                
                                (15.38 µs … 3.28 ms)  23.92 µs    ▂█▅               
                             (  1.17 kb … 644.51 kb)   5.00 kb ▁▁▄███▄▂▂▁▂▂▂▁▁▁▁▁▁▁▁

summary
  ES512 - @node-rs/jsonwebtoken (sync)
   7.75x faster than ES512 - @node-rs/jsonwebtoken (async)
   483.91x faster than ES512 - jose (sync)
   489.87x faster than ES512 - fast-jwt (sync)
   591.01x faster than ES512 - jsonwebtoken (sync)
   591.64x faster than ES512 - fast-jwt (async)
   593.78x faster than ES512 - jsonwebtoken (async)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (sync)                     2.72 ms/iter   2.71 ms    █▆                
                                 (2.58 ms … 3.32 ms)   3.31 ms    ██                
                             (  4.82 kb …  15.43 kb)   4.92 kb ▁▁▂██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)             3.57 ms/iter   3.60 ms                ▃█    
                                 (3.38 ms … 3.66 ms)   3.65 ms              ▅ ██    
                             (  8.88 kb …  16.13 kb)   9.12 kb ▁▄▂▁▂▁▁▁▁▁▁▁▅██████▅▁

RS512 - jsonwebtoken (async)            3.44 ms/iter   3.45 ms      █               
                                 (3.39 ms … 3.63 ms)   3.58 ms  ▄▇▅▆██▂             
                             ( 15.12 kb …  63.49 kb)  15.97 kb █████████▆▄▂▂▂▁▁▁▁▁▁▂

RS512 - fast-jwt (sync)                 2.72 ms/iter   2.71 ms   █                  
                                 (2.65 ms … 3.31 ms)   3.29 ms   █                  
                             (  4.41 kb …  52.62 kb)   4.63 kb ▁▃█▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)                3.60 ms/iter   3.62 ms           ▅   █      
                                 (3.50 ms … 3.68 ms)   3.66 ms          ▃██▇▅█▆▄    
                             ( 12.63 kb …  14.51 kb)  12.65 kb ▂▂▁▁▁▃▁▂▇█████████▇▇▅

RS512 - @node-rs/jsonwebtoken (sync)    2.48 ms/iter   2.49 ms █▆                   
                                 (2.42 ms … 2.79 ms)   2.77 ms ██▂                  
                             (  2.02 kb …   2.28 kb)   2.03 kb █████▃▂▂▁▁▁▂▄▂▂▁▁▂▂▂▂

RS512 - @node-rs/jsonwebtoken (async)   2.47 ms/iter   2.47 ms  █                   
                                 (2.45 ms … 2.62 ms)   2.57 ms  █                   
                             (  5.30 kb …  45.34 kb)   5.56 kb ▃█▆█▃▂▂▁▁▁▂▁▁▁▁▁▁▁▁▁▁

summary
  RS512 - @node-rs/jsonwebtoken (async)
   1x faster than RS512 - @node-rs/jsonwebtoken (sync)
   1.1x faster than RS512 - jose (sync)
   1.1x faster than RS512 - fast-jwt (sync)
   1.39x faster than RS512 - jsonwebtoken (async)
   1.45x faster than RS512 - jsonwebtoken (sync)
   1.46x faster than RS512 - fast-jwt (async)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (sync)                     2.74 ms/iter   2.72 ms █                    
                                 (2.70 ms … 3.33 ms)   3.32 ms █                    
                             (  4.91 kb …   5.84 kb)   4.95 kb █▇▂▄▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)             3.43 ms/iter   3.44 ms    ▄ ▅  ▇█           
                                 (3.36 ms … 3.66 ms)   3.54 ms    █▇██████▄         
                             (  7.88 kb …  10.35 kb)   8.94 kb ▃▆██████████▂▄▅▃▂▅▁▁▂

PS512 - jsonwebtoken (async)            3.47 ms/iter   3.48 ms      █               
                                 (3.39 ms … 4.08 ms)   3.68 ms   ▂▅▂█▆              
                             ( 14.05 kb … 123.86 kb)  17.08 kb ▂▇█████▇▅▁▂▁▁▁▁▃▃▁▁▁▁

PS512 - fast-jwt (sync)                 2.59 ms/iter   2.59 ms   █                  
                                 (2.52 ms … 3.20 ms)   3.19 ms  ██                  
                             (  3.88 kb …  40.93 kb)   4.63 kb ███▄▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (async)                3.76 ms/iter   3.79 ms    █                 
                                 (3.43 ms … 4.86 ms)   4.84 ms    █                 
                             ( 11.66 kb …   1.17 mb)  25.17 kb ▂▂██▂▅▂▂▂▂▁▃▃▂▁▁▁▁▁▂▁

PS512 - @node-rs/jsonwebtoken (sync)    2.46 ms/iter   2.47 ms  █                   
                                 (2.43 ms … 2.52 ms)   2.52 ms  █▅▄▃▂               
                             (  2.02 kb …   2.28 kb)   2.03 kb ██████▅▆▆▃▃▁▁▃▄▂▃█▆▂▃

PS512 - @node-rs/jsonwebtoken (async)   2.53 ms/iter   2.47 ms █                    
                                 (2.45 ms … 8.28 ms)   4.55 ms █                    
                             (  5.30 kb …  45.34 kb)   5.57 kb █▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  PS512 - @node-rs/jsonwebtoken (sync)
   1.03x faster than PS512 - @node-rs/jsonwebtoken (async)
   1.05x faster than PS512 - fast-jwt (sync)
   1.11x faster than PS512 - jose (sync)
   1.4x faster than PS512 - jsonwebtoken (sync)
   1.41x faster than PS512 - jsonwebtoken (async)
   1.53x faster than PS512 - fast-jwt (async)
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (sync)                    38.84 µs/iter  38.80 µs █ █                  
                               (38.19 µs … 41.17 µs)  39.64 µs █ █     █           █
                             (Infinity pb … -Infinity  b)       NaN █▁██▁▁▁▁█▁▁▁▁▁▁▁▁▁▁▁█

EdDSA - fast-jwt (sync)                35.35 µs/iter  35.55 µs ██   ████ ███ █     █
                               (34.20 µs … 37.78 µs)  36.38 µs ██   ████ ███ █     █
                             (  2.29 kb …   2.29 kb)   2.29 kb ██▁▁▁████▁███▁█▁▁▁▁▁█

EdDSA - fast-jwt (async)              296.86 µs/iter 300.38 µs        █▄            
                               (273.54 µs … 1.66 ms) 340.96 µs        ██            
                             (  7.33 kb … 942.83 kb)  10.83 kb ▃██▇▅▃███▇▄▂▂▁▂▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)    2.48 µs/iter   2.49 µs          █           
                                 (2.46 µs … 2.52 µs)   2.51 µs  ▆█▃▆▆█ ▆█ ▆▃ ▃▃     
                             (  1.27 kb …   1.27 kb)   1.27 kb ▄████████████████▄█▄█

EdDSA - @node-rs/jsonwebtoken (async)  18.74 µs/iter  17.42 µs     █                
                                (15.54 µs … 3.33 ms)  23.92 µs    ██                
                             (  4.23 kb … 644.45 kb)   4.94 kb ▁▃███▇▃▂▂▂▂▂▁▁▁▁▁▁▁▁▁

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   7.55x faster than EdDSA - @node-rs/jsonwebtoken (async)
   14.25x faster than EdDSA - fast-jwt (sync)
   15.66x faster than EdDSA - jose (sync)
   119.68x faster than EdDSA - fast-jwt (async)
```

## Decoding

```
clk: ~3.74 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                920.72 ns/iter 924.96 ns      █               
                       (902.07 ns … 963.54 ns) 954.15 ns    ▃ █▆▂▅            
                       (259.68  b … 458.22  b) 456.85  b ▂▄▇███████▇▅▃▃▃▃▂▂▂▃▂

RS512 - fast-jwt (complete)     930.44 ns/iter 938.46 ns        █▇            
                         (891.65 ns … 1.01 µs) 992.23 ns     ▅ ▅███▃          
                       (350.72  b … 578.23  b) 576.63  b ▃▅▂████████▇▃▆▄▂▁▁▃▁▂

RS512 - jsonwebtoken              1.64 µs/iter   1.65 µs        █             
                           (1.56 µs … 1.74 µs)   1.74 µs       ▂█▅ ▂          
                       (857.29  b … 867.14  b) 866.93  b ▂▂▂▅▁▂█████▅▃▂▃▂▄▁▂▁▂

RS512 - jsonwebtoken (complete)   1.59 µs/iter   1.60 µs           █▆         
                           (1.56 µs … 1.63 µs)   1.62 µs   ▂ ▂ ▇▂████  ▅▂     
                       (858.63  b … 891.15  b) 874.13  b ▅▁███████████▆██▃▆▃▃▃

RS512 - jose                    737.70 ns/iter 741.18 ns         █▄           
                       (699.97 ns … 783.59 ns) 777.10 ns        ▂██▄          
                       (288.90  b … 426.24  b) 425.45  b ▁▁▁▁▁▁▄████▇▆▁▃▄▃▂▃▁▁

RS512 - jose (complete)         738.40 ns/iter 739.71 ns           █▇         
                       (698.66 ns … 779.42 ns) 768.52 ns           ██▂        
                       (414.52  b … 446.12  b) 439.55  b ▂▁▁▂▂▁▁▁▂▅███▄▃▁▂▃▄▂▂

summary
  RS512 - jose
   1x faster than RS512 - jose (complete)
   1.25x faster than RS512 - fast-jwt
   1.26x faster than RS512 - fast-jwt (complete)
   2.16x faster than RS512 - jsonwebtoken (complete)
   2.22x faster than RS512 - jsonwebtoken
```

Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying

```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)               3.08 µs/iter   3.94 µs █                    
                               (2.64 µs … 4.17 µs)   4.09 µs ██                ▃  
                           (  1.26 kb …   1.26 kb)   1.26 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▆▂

HS512 - fast-jwt (async)             36.52 µs/iter  36.16 µs   █                  
                             (31.54 µs … 50.28 µs)  46.04 µs  ██                  
                           (732.49  b …   3.62 kb)   1.31 kb ███▁███▁▁▁▁▁▁█▁▁▁▁▁▁█

HS512 - fast-jwt (sync with cache)    1.28 µs/iter   1.08 µs  █                   
                             (916.32 ns … 2.81 µs)   2.80 µs ▄█▂                  
                           (470.03  b …   1.26 kb) 716.21  b ███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▃▃

HS512 - fast-jwt (async with cache)   8.75 µs/iter   9.06 µs                ▂█    
                               (7.35 µs … 9.45 µs)   9.26 µs      ▅         ██  ▅ 
                           (  3.16 kb …   3.23 kb)   3.19 kb ▇▁▁▁▁█▁▁▁▁▁▁▁▁▁██▇▇█▇

HS512 - jose (sync)                   3.63 µs/iter   3.29 µs   █▆▂▃               
                               (2.79 µs … 3.58 ms)   4.58 µs   ████▅              
                           (168.00  b … 653.12 kb)   2.37 kb ▁▅██████▃▂▂▁▁▁▂▂▂▂▁▁▁

HS512 - jsonwebtoken (sync)         221.06 µs/iter 222.75 µs    ▆█                
                           (209.83 µs … 366.63 µs) 254.67 µs  ▅▄███               
                           (  6.15 kb …   1.12 mb)   9.72 kb ▃██████▆▅▄▅▃▃▂▁▂▁▁▁▁▁

HS512 - jsonwebtoken (async)        240.36 µs/iter 243.54 µs         █▆           
                             (219.00 µs … 1.13 ms) 273.08 µs        ███▃          
                           (  8.39 kb … 648.49 kb)   9.00 kb ▂▃▄▄▇█▇████▄▃▂▂▁▁▁▁▁▁

summary
  HS512 - fast-jwt (sync with cache)
   2.41x faster than HS512 - fast-jwt (sync)
   2.83x faster than HS512 - jose (sync)
   6.83x faster than HS512 - fast-jwt (async with cache)
   28.48x faster than HS512 - fast-jwt (async)
   172.41x faster than HS512 - jsonwebtoken (sync)
   187.46x faster than HS512 - jsonwebtoken (async)
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)             902.37 µs/iter 904.17 µs            █         
                           (841.46 µs … 994.71 µs) 947.21 µs           ▃█         
                           (  1.29 kb …   1.13 mb)   5.53 kb ▁▁▁▁▁▁▁▁▁▁██▆▄▃▂▂▁▁▁▁

ES512 - fast-jwt (async)              1.00 ms/iter   1.01 ms            █▇        
                             (938.08 µs … 1.16 ms)   1.05 ms            ██▃       
                           (  7.20 kb … 524.95 kb)   8.48 kb ▁▁▁▁▁▁▂▂▁▁▄███▄▂▁▂▁▁▁

ES512 - fast-jwt (sync with cache)    1.39 µs/iter   1.29 µs     ▇█               
                               (1.04 µs … 4.00 ms)   1.88 µs     ██▂              
                           (752.00  b … 169.67 kb) 813.31  b ▁▁▂▇███▄▂▂▂▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   8.69 µs/iter   7.58 µs     █▂ ▃             
                               (6.38 µs … 5.76 ms)   9.63 µs    ▄██▆█▇            
                           (  3.01 kb … 643.25 kb)   3.49 kb ▁▁▃██████▇▃▂▁▁▁▁▁▁▁▁▁

ES512 - jose (sync)                 920.14 µs/iter 922.25 µs            █         
                           (874.17 µs … 986.13 µs) 952.00 µs            █▇        
                           (  2.95 kb … 851.62 kb)   4.83 kb ▁▁▁▁▁▁▁▁▁▁▅██▇▄▂▂▂▁▁▁

ES512 - jsonwebtoken (sync)         997.83 µs/iter   1.00 ms           ▆█         
                             (943.13 µs … 1.08 ms)   1.04 ms           ██▂        
                           (  4.36 kb …   1.70 mb)  10.47 kb ▁▁▁▂▂▁▁▁▁▄███▅▃▂▂▃▃▂▁

ES512 - jsonwebtoken (async)          1.00 ms/iter   1.01 ms  ▄█▇▅                
                             (993.83 µs … 1.13 ms)   1.05 ms  ████                
                           (  6.45 kb … 505.47 kb)   7.64 kb ▃██████▅▄▂▂▁▁▁▁▁▁▁▁▁▁

summary
  ES512 - fast-jwt (sync with cache)
   6.27x faster than ES512 - fast-jwt (async with cache)
   651.4x faster than ES512 - fast-jwt (sync)
   664.23x faster than ES512 - jose (sync)
   720.31x faster than ES512 - jsonwebtoken (sync)
   722.93x faster than ES512 - fast-jwt (async)
   725.14x faster than ES512 - jsonwebtoken (async)
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)              45.96 µs/iter  46.04 µs      █               
                            (42.04 µs … 147.75 µs)  53.83 µs      █▅              
                           ( 80.00  b … 368.58 kb)   2.64 kb ▁▁▁▁▁██▆▄▃▂▂▂▂▁▁▁▁▁▁▁

RS512 - fast-jwt (async)            159.93 µs/iter 158.50 µs      █▆              
                             (149.21 µs … 2.34 ms) 176.13 µs      ██▅             
                           (  7.48 kb … 647.55 kb)   8.90 kb ▁▁▁▂████▇▃▂▂▁▂▁▁▁▁▁▁▁

RS512 - fast-jwt (sync with cache)    1.61 µs/iter   1.39 µs █                    
                               (1.32 µs … 3.03 µs)   2.98 µs █▄                   
                           (711.77  b … 955.12  b) 723.91  b ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▄▃

RS512 - fast-jwt (async with cache)   8.86 µs/iter   9.11 µs                 █    
                               (7.66 µs … 9.47 µs)   9.39 µs                 █    
                           (  3.17 kb …   3.22 kb)   3.19 kb ▅▁▅▅▁▁▁▁▁▁▅▁▁▁▁▅█▅▁█▅

RS512 - jose (sync)                  43.83 µs/iter  45.25 µs  █                   
                             (41.79 µs … 79.25 µs)  50.08 µs  █      ▅            
                           (176.00  b … 516.68 kb)   3.20 kb ▃██▆▄▃▂▁██▄▃▂▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)         125.56 µs/iter 129.21 µs  ▇█                  
                             (119.83 µs … 1.21 ms) 143.08 µs  ██▅     ▂           
                           (  8.26 kb … 870.09 kb)  10.54 kb ▃███▇▆▃▂▅█▆▄▃▂▂▁▁▁▁▁▁

RS512 - jsonwebtoken (async)        141.69 µs/iter 141.75 µs       ▅█             
                             (132.83 µs … 1.49 ms) 153.04 µs       ███▄           
                           ( 10.35 kb … 650.39 kb)  10.84 kb ▁▁▁▁▃▇█████▄▃▂▂▁▁▁▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   5.5x faster than RS512 - fast-jwt (async with cache)
   27.21x faster than RS512 - jose (sync)
   28.53x faster than RS512 - fast-jwt (sync)
   77.95x faster than RS512 - jsonwebtoken (sync)
   87.96x faster than RS512 - jsonwebtoken (async)
   99.28x faster than RS512 - fast-jwt (async)
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)              45.96 µs/iter  46.01 µs        █             
                             (45.21 µs … 47.09 µs)  46.95 µs ▅▅▅▅  ▅█▅▅         ▅▅
                           (  1.68 kb …   1.68 kb)   1.68 kb ████▁▁████▁▁▁▁▁▁▁▁▁██

PS512 - fast-jwt (async)            102.62 µs/iter 101.58 µs       █              
                              (90.96 µs … 6.78 ms) 121.96 µs       █▇             
                           (560.00  b … 882.05 kb)   8.36 kb ▁▅█▄▃▅██▆▂▂▂▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)    1.58 µs/iter   1.37 µs  █                   
                               (1.27 µs … 3.10 µs)   2.97 µs  █                   
                           (703.58  b … 960.77  b) 715.79  b ▇█▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▃

PS512 - fast-jwt (async with cache)   8.77 µs/iter   9.08 µs                 █    
                               (7.50 µs … 9.30 µs)   9.27 µs                 █    
                           (  3.08 kb …   3.20 kb)   3.12 kb █▁▁▅▁▁▁▁▁▁▁▁▁▁▁▅█▅▅▅█

PS512 - jose (sync)                  46.19 µs/iter  47.38 µs         █            
                            (43.42 µs … 111.00 µs)  52.50 µs  █▄     █▇           
                           (  2.19 kb … 307.05 kb)   3.29 kb ▄██▆▃▂▂▄██▇▃▂▁▂▂▁▁▁▁▁

PS512 - jsonwebtoken (sync)          74.79 µs/iter  76.04 µs   █      ▇           
                              (68.75 µs … 3.37 ms)  84.17 µs   █▅    ▂█▇          
                           (336.00  b … 544.27 kb)   9.37 kb ▁███▄▂▃▃███▅▃▃▂▂▁▁▁▁▁

PS512 - jsonwebtoken (async)         81.82 µs/iter  82.29 µs    █                 
                              (75.13 µs … 3.89 ms)  93.33 µs   ▄█▄                
                           ( 10.27 kb … 650.30 kb)  10.89 kb ▁▃███▄▃▃▅█▅▂▂▁▁▁▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   5.54x faster than PS512 - fast-jwt (async with cache)
   29.01x faster than PS512 - fast-jwt (sync)
   29.16x faster than PS512 - jose (sync)
   47.21x faster than PS512 - jsonwebtoken (sync)
   51.65x faster than PS512 - jsonwebtoken (async)
   64.77x faster than PS512 - fast-jwt (async)
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)              79.15 µs/iter  78.92 µs  █                   
                              (77.13 µs … 1.68 ms)  90.92 µs  █▃                  
                           (  2.13 kb … 383.77 kb)   3.01 kb ▆██▄▄▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)            149.27 µs/iter 150.25 µs  █                   
                             (136.63 µs … 2.64 ms) 218.04 µs  █ █                 
                           (  7.10 kb … 647.14 kb)   8.21 kb ▅█▆██▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)    1.23 µs/iter   1.06 µs █                    
                             (970.02 ns … 2.31 µs)   2.17 µs █▂                   
                           (613.01  b …   1.45 kb) 893.00  b ██▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂█▁

EdDSA - fast-jwt (async with cache)   8.75 µs/iter   9.06 µs                    █ 
                               (7.38 µs … 9.19 µs)   9.17 µs               ▂    █▂
                           (  3.37 kb …   3.47 kb)   3.40 kb ▆▁▁▆▁▁▁▁▁▁▁▁▆▁█▆▆▆▁██

EdDSA - jose (sync)                  79.44 µs/iter  79.17 µs  █                   
                            (77.88 µs … 909.08 µs)  90.21 µs  █                   
                           (  2.52 kb … 534.39 kb)   3.62 kb ▃██▃▃▂▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   7.14x faster than EdDSA - fast-jwt (async with cache)
   64.59x faster than EdDSA - fast-jwt (sync)
   64.82x faster than EdDSA - jose (sync)
   121.8x faster than EdDSA - fast-jwt (async)
```
