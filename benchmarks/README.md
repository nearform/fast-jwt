# Benchmarks

Made with [mitata](https://github.com/evanwashere/mitata) library

## Signing


<details>
    <summary>HS256</summary>

## HS256
```
clk: ~3.18 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS256 - jose (sync)                     2.99 µs/iter   2.79 µs  █                   
                               (2.50 µs … 756.75 µs)   6.46 µs  █                   
                             (176.00  b … 975.45 kb)   2.93 kb ▁█▄▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (sync)             2.95 µs/iter   2.83 µs  █                   
                               (2.58 µs … 534.75 µs)   6.00 µs  █                   
                             (352.00  b … 791.84 kb)   3.72 kb ▆█▅▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (async)            3.60 µs/iter   3.65 µs      ▃█▃         ▃   
                                 (3.52 µs … 3.70 µs)   3.69 µs ▂▂▂  ███▇ ▂     ▂█▇  
                             (864.48  b …   3.09 kb)   2.85 kb ███▆▆████▆█▆▁▆▆▆███▆▆

HS256 - fast-jwt (sync)                 2.09 µs/iter   2.18 µs     █▃               
                                 (1.97 µs … 2.26 µs)   2.24 µs ▂█  ██        ▂  ▂▂  
                             (  1.48 kb …   1.50 kb)   1.49 kb ███▆██▅▃▁▁▁▁▁▅█▆▅████

HS256 - fast-jwt (async)                3.55 µs/iter   3.56 µs          █           
                                 (3.29 µs … 3.86 µs)   3.79 µs         ▆█           
                             (  3.44 kb …   3.55 kb)   3.52 kb ▂▁▁▁▁▁▁▁██▇█▄▁▅▁▁▁▁▄▂

HS256 - @node-rs/jsonwebtoken (sync)    2.65 µs/iter   2.66 µs    ▆█                
                                 (2.62 µs … 2.79 µs)   2.73 µs   ▅██▂██▅▂           
                             (  1.27 kb …   1.27 kb)   1.27 kb ▃▆████████▆▃▁▁▃▁▁▃▁▁▃

HS256 - @node-rs/jsonwebtoken (async)   9.63 µs/iter   9.79 µs     █                
                               (7.67 µs … 217.17 µs)  15.25 µs    ▂█▄▃              
                             (  1.79 kb … 193.80 kb)   2.21 kb ▁▁▂████▂▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  HS256 - fast-jwt (sync)
   1.27x faster than HS256 - @node-rs/jsonwebtoken (sync)
   1.41x faster than HS256 - jsonwebtoken (sync)
   1.43x faster than HS256 - jose (sync)
   1.7x faster than HS256 - fast-jwt (async)
   1.72x faster than HS256 - jsonwebtoken (async)
   4.61x faster than HS256 - @node-rs/jsonwebtoken (async)
```
</details>


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.28 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (sync)                     2.93 µs/iter   2.96 µs       █              
                                 (2.81 µs … 3.21 µs)   3.20 µs ▇    ▇█ ▄            
                             (801.16  b …   2.74 kb)   2.53 kb █▃▃▁▆████▅▁▃▅▃▃▁▃▁▁▁▃

HS512 - jsonwebtoken (sync)             3.00 µs/iter   3.01 µs        ██▃           
                                 (2.91 µs … 3.15 µs)   3.14 µs   ▇    ███▅          
                             (  3.56 kb …   3.56 kb)   3.56 kb ▃▆█▆▃▃█████▁▁▁▃▁▁▃▁▁▆

HS512 - jsonwebtoken (async)            3.89 µs/iter   3.90 µs     ▂ ▂█             
                                 (3.82 µs … 4.07 µs)   4.03 µs     █▇██             
                             (  3.02 kb …   3.13 kb)   3.09 kb ▇▁▇▇████▄▇▇▁▁▁▄▁▁▄▁▁▄

HS512 - fast-jwt (sync)                 2.49 µs/iter   2.56 µs ▅█    ▅      ▂       
                                 (2.38 µs … 2.63 µs)   2.62 µs ██▅  ▇█      █▇▅  ▂▇ 
                             (  1.60 kb …   1.60 kb)   1.60 kb ███▇▇██▄▁▁▁▄▁███▄▇██▄

HS512 - fast-jwt (async)                3.95 µs/iter   3.99 µs             ▂█▅ ▂    
                                 (3.69 µs … 4.17 µs)   4.06 µs             ███▂█▅   
                             (  3.50 kb …   3.60 kb)   3.57 kb ▄▁▁▄▁▁▁▁▁▁▁▁██████▄▄▄

HS512 - @node-rs/jsonwebtoken (sync)    3.34 µs/iter   3.35 µs       █▂             
                                 (3.31 µs … 3.42 µs)   3.40 µs ▅▅▇▂▂ ██▂▂           
                             (  1.30 kb …   1.31 kb)   1.31 kb █████▄████▇▄▁▄▄▄▁▁▁▁▄

HS512 - @node-rs/jsonwebtoken (async)  12.64 µs/iter  13.00 µs         █▆▂          
                               (8.67 µs … 115.13 µs)  17.42 µs        ████          
                             (  1.83 kb … 193.84 kb)   2.25 kb ▁▁▁▁▁▄▆█████▃▃▂▁▁▁▁▁▁

summary
  HS512 - fast-jwt (sync)
   1.18x faster than HS512 - jose (sync)
   1.21x faster than HS512 - jsonwebtoken (sync)
   1.34x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.57x faster than HS512 - jsonwebtoken (async)
   1.59x faster than HS512 - fast-jwt (async)
   5.08x faster than HS512 - @node-rs/jsonwebtoken (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.29 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
ES512 - jose (sync)                     1.37 ms/iter   1.38 ms        █             
                                 (1.33 ms … 1.53 ms)   1.45 ms  █     █▅            
                             (  3.66 kb …   1.44 mb)   9.53 kb ▅█▇▄▄▄▃██▇▇▅▃▃▃▂▂▂▁▁▁

ES512 - jsonwebtoken (sync)             1.38 ms/iter   1.39 ms  ▂     ▄█            
                                 (1.34 ms … 1.56 ms)   1.45 ms  █▄    ███▃          
                             (  6.02 kb …  24.08 kb)   7.12 kb ▅████▅▆█████▄▅▃▂▂▂▁▂▂

ES512 - jsonwebtoken (async)            1.37 ms/iter   1.36 ms  █                   
                                 (1.34 ms … 2.51 ms)   1.54 ms ██▆                  
                             (  9.45 kb … 763.13 kb)  14.00 kb ███▆▃▂▂▂▂▂▃▁▁▂▁▁▁▁▁▁▁

ES512 - fast-jwt (sync)                 1.38 ms/iter   1.39 ms  █                   
                                 (1.33 ms … 2.12 ms)   1.58 ms ▄█▄                  
                             (  2.57 kb …  99.04 kb)   3.57 kb ███▆▃▂▃▃▂▄▄▂▂▂▂▁▂▁▁▁▁

ES512 - fast-jwt (async)                1.64 ms/iter   1.64 ms ▂█                   
                                 (1.57 ms … 1.96 ms)   1.94 ms ██▄                  
                             (  5.05 kb …   1.48 mb)  10.42 kb ███▄▃▂▂▃▃▃▂▂▁▂▁▂▂▂▃▂▂

ES512 - @node-rs/jsonwebtoken (sync)    2.96 µs/iter   2.97 µs         █ ▅▅▅▅       
                                 (2.90 µs … 3.03 µs)   3.01 µs         ███████      
                             (  1.27 kb …   1.27 kb)   1.27 kb ▄▄▄█▁▁▄████████▄█▁▁▁▄

ES512 - @node-rs/jsonwebtoken (async)  11.10 µs/iter  12.71 µs     █                
                               (8.29 µs … 168.33 µs)  17.29 µs    ▄█▃               
                             (  1.80 kb … 193.80 kb)   2.24 kb ▁▂▂███▂▁▁▁▄▇▄▂▂▁▁▁▁▁▁

summary
  ES512 - @node-rs/jsonwebtoken (sync)
   3.75x faster than ES512 - @node-rs/jsonwebtoken (async)
   462.07x faster than ES512 - jsonwebtoken (async)
   463.55x faster than ES512 - jose (sync)
   464.51x faster than ES512 - jsonwebtoken (sync)
   466.29x faster than ES512 - fast-jwt (sync)
   552.88x faster than ES512 - fast-jwt (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.29 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (sync)                     3.31 ms/iter   3.31 ms ▅█                   
                                 (3.26 ms … 4.06 ms)   4.02 ms ██                   
                             (  4.87 kb …   5.09 kb)   4.88 kb ██▇▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - jsonwebtoken (sync)             3.31 ms/iter   3.31 ms ▇█                   
                                 (3.26 ms … 4.06 ms)   4.01 ms ██                   
                             (  7.91 kb …   9.31 kb)   8.29 kb ██▅▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - jsonwebtoken (async)            3.33 ms/iter   3.32 ms ▆█                   
                                 (3.26 ms … 4.13 ms)   4.03 ms ██▃                  
                             ( 11.70 kb …  21.41 kb)  12.06 kb ███▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - fast-jwt (sync)                 3.30 ms/iter   3.30 ms █▃                   
                                 (3.26 ms … 4.04 ms)   4.01 ms ██                   
                             (  4.41 kb …   7.91 kb)   4.48 kb ██▅▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)                4.34 ms/iter   4.34 ms  ▂▅█                 
                                 (4.27 ms … 4.74 ms)   4.66 ms  ███                 
                             (  9.95 kb …  13.37 kb)  10.01 kb ▄████▇▂▄▂▁▁▃▂▂▂▁▁▁▂▁▃

RS512 - @node-rs/jsonwebtoken (sync)    3.16 ms/iter   3.18 ms █▇█ ▅▃               
                                 (3.13 ms … 3.31 ms)   3.25 ms ██████▆▆             
                             (  2.02 kb …   2.27 kb)   2.02 kb █████████▇▆▇▅▄▃▄▁▂▃▁▂

RS512 - @node-rs/jsonwebtoken (async)   3.18 ms/iter   3.20 ms   █                  
                                 (3.15 ms … 3.31 ms)   3.26 ms ▄██▆███▃▄▃▂          
                             (  2.63 kb …   2.87 kb)   2.63 kb ███████████▄▇▃▇▂▂▃▃▃▂

summary
  RS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than RS512 - @node-rs/jsonwebtoken (async)
   1.04x faster than RS512 - fast-jwt (sync)
   1.05x faster than RS512 - jsonwebtoken (sync)
   1.05x faster than RS512 - jose (sync)
   1.05x faster than RS512 - jsonwebtoken (async)
   1.37x faster than RS512 - fast-jwt (async)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.28 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (sync)                     3.39 ms/iter   3.40 ms  █                   
                                 (3.27 ms … 4.65 ms)   4.17 ms  █▆                  
                             (  4.91 kb …   5.52 kb)   4.95 kb ███▇▆▄▂▂▂▂▁▁▁▁▁▁▁▁▁▁▂

PS512 - jsonwebtoken (sync)             3.41 ms/iter   3.40 ms  █                   
                                 (3.26 ms … 5.73 ms)   4.63 ms  █                   
                             (  6.97 kb …   9.31 kb)   8.16 kb ██▇▆▂▁▁▁▁▁▁▁▂▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)            3.35 ms/iter   3.34 ms  █                   
                                 (3.26 ms … 4.15 ms)   4.04 ms ▇█                   
                             ( 10.45 kb …  59.93 kb)  12.68 kb ███▅▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▂

PS512 - fast-jwt (sync)                 3.33 ms/iter   3.33 ms  █                   
                                 (3.26 ms … 4.07 ms)   4.02 ms ▄█▃                  
                             (  3.89 kb …  53.63 kb)   4.72 kb ███▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (async)                4.32 ms/iter   4.34 ms  ▄█                  
                                 (4.26 ms … 4.72 ms)   4.60 ms  ███▄▂               
                             (  9.15 kb …  41.28 kb)  10.15 kb ▅█████▇█▃▂▂▂▂▁▁▂▁▁▁▁▂

PS512 - @node-rs/jsonwebtoken (sync)    3.17 ms/iter   3.18 ms  █ ▄                 
                                 (3.14 ms … 3.32 ms)   3.31 ms  ███▆▂               
                             (  2.02 kb …   2.09 kb)   2.02 kb ▆██████▇▃▁▁▂▁▁▂▁▁▁▁▁▂

PS512 - @node-rs/jsonwebtoken (async)   3.19 ms/iter   3.20 ms   █▂ ▄               
                                 (3.16 ms … 3.33 ms)   3.26 ms   ██▇█▆ ▆▆           
                             (  2.63 kb …   2.87 kb)   2.63 kb ███████████▇▇▃▆▃▅▁▁▁▃

summary
  PS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than PS512 - @node-rs/jsonwebtoken (async)
   1.05x faster than PS512 - fast-jwt (sync)
   1.05x faster than PS512 - jsonwebtoken (async)
   1.07x faster than PS512 - jose (sync)
   1.07x faster than PS512 - jsonwebtoken (sync)
   1.36x faster than PS512 - fast-jwt (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.29 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (sync)                    30.39 µs/iter  29.89 µs        █             
                               (29.35 µs … 37.81 µs)  30.10 µs ▅ ▅  ▅ █  ▅ ▅ ▅▅  ▅ ▅
                             (  3.23 kb …   3.23 kb)   3.23 kb █▁█▁▁█▁█▁▁█▁█▁██▁▁█▁█

EdDSA - fast-jwt (sync)                29.24 µs/iter  29.21 µs █                    
                               (28.88 µs … 30.95 µs)  29.32 µs █  ▅    ▅▅▅▅▅  ▅▅   ▅
                             (  1.89 kb …   1.90 kb)   1.89 kb █▁▁█▁▁▁▁█████▁▁██▁▁▁█

EdDSA - fast-jwt (async)              267.19 µs/iter 269.42 µs █ ▂                  
                             (259.33 µs … 781.96 µs) 308.71 µs ███                  
                             (  4.05 kb … 661.27 kb)   6.61 kb ████▇▇▅▃▃▂▂▂▁▁▁▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)    3.00 µs/iter   3.02 µs              ██      
                                 (2.93 µs … 3.06 µs)   3.05 µs  ▅▂    ▂    ▂██▅▇  ▂ 
                             (  1.27 kb …   1.27 kb)   1.27 kb ▄██▄▇▄▄█▄▄▁▄█████▇▁█▄

EdDSA - @node-rs/jsonwebtoken (async)  10.88 µs/iter  10.58 µs    ▇█                
                               (8.33 µs … 130.92 µs)  17.63 µs    ██                
                             (  1.80 kb … 129.80 kb)   2.20 kb ▁▁▅██▇▂▂▁▁▃▄▄▃▂▂▁▁▁▁▁

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   3.63x faster than EdDSA - @node-rs/jsonwebtoken (async)
   9.76x faster than EdDSA - fast-jwt (sync)
   10.14x faster than EdDSA - jose (sync)
   89.14x faster than EdDSA - fast-jwt (async)
```
</details>


## Decoding


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.26 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                  1.10 µs/iter   1.11 µs         █▃           
                           (1.06 µs … 1.17 µs)   1.15 µs        ▂██▅          
                       (336.29  b … 458.22  b) 457.16  b ▃████▃▄████▆▄▃▃▃▂▃▃▂▃

RS512 - fast-jwt (complete)       1.09 µs/iter   1.10 µs   ▄█                 
                           (1.06 µs … 1.18 µs)   1.16 µs  ▇██▇▂               
                       (461.23  b … 578.24  b) 577.20  b ▇██████▆▇▆▅▅▇▄▅▃▂▂▁▁▂

RS512 - jsonwebtoken              1.86 µs/iter   1.86 µs           ▄█         
                           (1.81 µs … 1.89 µs)   1.89 µs          ▂███▄       
                       (857.28  b … 867.14  b) 866.93  b ▂▂▁▁▁▄▂▄▆█████▅▅▅▅█▄▂

RS512 - jsonwebtoken (complete)   1.86 µs/iter   1.87 µs           ███ █      
                           (1.81 µs … 1.90 µs)   1.90 µs          ▅██████▅ ▅  
                       (858.54  b … 891.17  b) 871.30  b ▆▃▁▆▃▁█▃▆████████▃██▆

RS512 - jose                    849.59 ns/iter 856.30 ns       ▄█▅            
                       (820.44 ns … 891.41 ns) 889.56 ns      ▇███▅           
                       (276.84  b … 426.25  b) 425.28  b ▂▃▂▃██████▅▅▇▇█▅▂▄▂▂▂

RS512 - jose (complete)         880.87 ns/iter 887.38 ns           ▄█▅        
                       (835.35 ns … 930.96 ns) 919.86 ns         ▂▆███        
                       (414.49  b … 446.12  b) 438.27  b ▂▂▁▃▅▄▂▇█████▇▇▄▄▅▂▃▃

summary
  RS512 - jose
   1.04x faster than RS512 - jose (complete)
   1.28x faster than RS512 - fast-jwt (complete)
   1.29x faster than RS512 - fast-jwt
   2.18x faster than RS512 - jsonwebtoken
   2.19x faster than RS512 - jsonwebtoken (complete)
```
</details>


Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying


<details>
    <summary>HS256</summary>

## HS256
```
clk: ~3.28 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS256 - fast-jwt (sync)               2.58 µs/iter   2.70 µs ▃█▆                  
                               (2.48 µs … 2.86 µs)   2.81 µs ███            ▆     
                           (  1.28 kb …   1.28 kb)   1.28 kb ███▃▁▁▁▁▁▃▃▁▁███▄▁▃▁▃

HS256 - fast-jwt (async)              4.76 µs/iter   4.76 µs     █▅ ▅             
                               (4.40 µs … 5.40 µs)   5.35 µs     ██▃█             
                           (  3.48 kb …   3.59 kb)   3.55 kb ▄▁▁▁████▄▁▄█▁▄▁▁▄▄▁▁▄

HS256 - fast-jwt (sync with cache)    1.04 µs/iter   1.19 µs  █                   
                             (886.48 ns … 1.55 µs)   1.44 µs  █                   
                           (272.52  b …   1.87 kb)   1.00 kb ▇██▁▁▂▁▁▁▁▁▁▁▁▁▁▁▂█▅▂

HS256 - fast-jwt (async with cache)   1.15 µs/iter   1.29 µs  █            ▅      
                             (987.19 ns … 1.51 µs)   1.43 µs  █▄          ▃█      
                           (  1.67 kb …   2.15 kb)   1.79 kb ▇██▃▂▂▂▁▁▁▁▁▆██▂▂▂▁▁▂

HS256 - jose (sync)                   3.50 µs/iter   3.33 µs  █                   
                             (3.00 µs … 914.79 µs)   7.21 µs  █                   
                           (656.00  b … 467.17 kb)   2.34 kb ▁█▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (sync)           3.82 µs/iter   3.81 µs       █              
                               (3.72 µs … 4.02 µs)   4.00 µs     ▅▂█▂             
                           (  3.50 kb …   3.50 kb)   3.50 kb ▃▅▁▁████▃▁▅▃▃▁▁▁▁▁▃▁▃

HS256 - jsonwebtoken (async)          3.87 µs/iter   3.92 µs        ▅      █      
                               (3.76 µs … 4.08 µs)   4.00 µs     ▆ ▆█ █    █      
                           ( 97.51  b … 216.72  b) 185.62  b ▄▄▄▄█▁█████▄▁██▄▁▁▁▁█

summary
  HS256 - fast-jwt (sync with cache)
   1.1x faster than HS256 - fast-jwt (async with cache)
   2.48x faster than HS256 - fast-jwt (sync)
   3.36x faster than HS256 - jose (sync)
   3.67x faster than HS256 - jsonwebtoken (sync)
   3.72x faster than HS256 - jsonwebtoken (async)
   4.57x faster than HS256 - fast-jwt (async)
```
</details>


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.29 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)               2.84 µs/iter   2.94 µs ▄▄ ▄ ▄         █     
                               (2.70 µs … 3.05 µs)   3.02 µs ████▅██       ▅█▅█   
                           (  1.54 kb …   1.54 kb)   1.54 kb ███████▅▁▁▅▅▁██████▅▅

HS512 - fast-jwt (async)              4.98 µs/iter   5.02 µs                 █    
                               (4.75 µs … 5.07 µs)   5.05 µs                ▃█▆▃ ▆
                           (  3.36 kb …   3.47 kb)   3.43 kb ▄▁▄▁▁▁▁▁▁▁▁█▄█▁██████

HS512 - fast-jwt (sync with cache)    1.21 µs/iter   1.15 µs ▂█                   
                               (1.02 µs … 2.65 µs)   1.87 µs ██                   
                           (666.24  b …   1.25 kb) 915.04  b ██▃▁▁▁▁▁▁▁▁▁▁▁▄█▃▁▁▁▁

HS512 - fast-jwt (async with cache)   1.30 µs/iter   1.47 µs  █                   
                               (1.14 µs … 1.54 µs)   1.53 µs ▃██             ▄▇   
                           (  1.58 kb …   1.69 kb)   1.67 kb ████▁▃▁▁▁▁▁▁▁▁▁▃██▇▆▄

HS512 - jose (sync)                   3.34 µs/iter   3.41 µs                █     
                               (3.16 µs … 3.50 µs)   3.49 µs       ▇▂      ▂█▅    
                           (  2.14 kb …   2.14 kb)   2.14 kb ▃▁▃▆▁███▆▆▃▃▃▃███▃▃▁▃

HS512 - jsonwebtoken (sync)           4.04 µs/iter   4.05 µs                  █   
                               (3.95 µs … 4.07 µs)   4.06 µs               ▅▂▇█▅▅ 
                           (  3.69 kb …   3.69 kb)   3.69 kb ▄▁▄▁▁▁▁▄▁▁▁▄▇▇██████▇

HS512 - jsonwebtoken (async)          4.15 µs/iter   4.19 µs           █          
                               (4.05 µs … 4.27 µs)   4.21 µs           ██       ▇ 
                           (302.09  b … 410.58  b) 377.66  b ▃▃▃▁▁▁▁▃▁▆██▃▁▁▁▃▆▆█▆

summary
  HS512 - fast-jwt (sync with cache)
   1.08x faster than HS512 - fast-jwt (async with cache)
   2.35x faster than HS512 - fast-jwt (sync)
   2.77x faster than HS512 - jose (sync)
   3.35x faster than HS512 - jsonwebtoken (sync)
   3.44x faster than HS512 - jsonwebtoken (async)
   4.13x faster than HS512 - fast-jwt (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.29 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)               1.03 ms/iter   1.05 ms ▃█▄                  
                             (998.71 µs … 1.19 ms)   1.17 ms ███▇▄▂               
                           (  2.16 kb … 451.07 kb)   3.08 kb ██████▇▇▇▄▅▃▃▁▂▃▂▂▁▁▁

ES512 - fast-jwt (async)              1.11 ms/iter   1.13 ms  █▄▃█                
                               (1.07 ms … 1.25 ms)   1.22 ms ▃████▄▆▂             
                           (  4.30 kb … 920.47 kb)   9.34 kb █████████▇▇▅▄▄▃▄▄▂▃▂▂

ES512 - fast-jwt (sync with cache)    1.56 µs/iter   1.29 µs  █                   
                               (1.04 µs … 2.47 ms)   5.50 µs ▃█                   
                           (952.00  b … 129.09 kb)   0.99 kb ██▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.60 µs/iter   1.42 µs  █                   
                               (1.17 µs … 1.65 ms)   4.79 µs ▄█                   
                           (  1.66 kb …  97.68 kb)   2.01 kb ██▆▄▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - jose (sync)                   1.12 ms/iter   1.06 ms █                    
                               (1.00 ms … 5.01 ms)   3.78 ms █                    
                           (  2.46 kb … 835.04 kb)   4.66 kb █▅▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (sync)           1.04 ms/iter   1.05 ms  █▃▄                 
                               (1.00 ms … 1.18 ms)   1.15 ms ▅████▃▃              
                           (  3.81 kb … 966.41 kb)   7.36 kb █████████▆▅▅▃▃▂▂▃▃▁▂▁

ES512 - jsonwebtoken (async)          1.04 ms/iter   1.05 ms  █▄                  
                             (999.92 µs … 1.18 ms)   1.15 ms ▇████▅               
                           (  4.34 kb … 524.85 kb)   5.13 kb █████████▅▅▅▃▂▃▃▃▃▂▂▂

summary
  ES512 - fast-jwt (sync with cache)
   1.02x faster than ES512 - fast-jwt (async with cache)
   661.22x faster than ES512 - fast-jwt (sync)
   662.49x faster than ES512 - jsonwebtoken (async)
   663.03x faster than ES512 - jsonwebtoken (sync)
   708.82x faster than ES512 - fast-jwt (async)
   714.05x faster than ES512 - jose (sync)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.23 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)              55.40 µs/iter  55.42 µs                     █
                             (54.99 µs … 56.66 µs)  55.62 µs ▅▅ ▅▅    ▅▅ ▅▅▅     █
                           (  1.72 kb …   1.72 kb)   1.72 kb ██▁██▁▁▁▁██▁███▁▁▁▁▁█

RS512 - fast-jwt (async)            142.64 µs/iter 143.83 µs  ▃█                  
                             (134.67 µs … 1.01 ms) 186.33 µs ▇██▇                 
                           (  4.32 kb … 581.60 kb)   5.69 kb █████▆▅▃▂▂▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (sync with cache)    1.83 µs/iter   1.76 µs   ▂ █                
                               (1.50 µs … 2.49 µs)   2.49 µs   ███▅               
                           (912.44  b …   1.00 kb) 923.07  b ▂▅████▃▁▁▁▁▁▁▁▁▂▂▃▆▆▆

RS512 - fast-jwt (async with cache)   1.93 µs/iter   2.13 µs  █   ▃▃         ▃    
                               (1.65 µs … 2.28 µs)   2.25 µs ▇█ ▂▂██▇       ██▅█  
                           (  1.59 kb …   1.69 kb)   1.68 kb ██▃█████▃▁▁▁▆▆▆████▃▆

RS512 - jose (sync)                  56.10 µs/iter  56.79 µs █▅                   
                            (53.04 µs … 860.38 µs)  75.58 µs ██ ▅                 
                           (  2.30 kb … 323.83 kb)   3.41 kb ██▅██▃▂▂▂▂▂▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)          56.90 µs/iter  57.69 µs                     █
                             (55.61 µs … 58.92 µs)  57.73 µs        █            █
                           (  1.47 kb …   1.47 kb)   1.47 kb ████▁▁▁█▁▁▁▁▁▁▁▁█▁▁██

RS512 - jsonwebtoken (async)         56.19 µs/iter  56.18 µs    ██ █              
                             (55.66 µs … 57.92 µs)  56.76 µs ▅  ██ █ ▅▅ ▅        ▅
                           (431.80  b … 439.38  b) 432.70  b █▁▁██▁█▁██▁█▁▁▁▁▁▁▁▁█

summary
  RS512 - fast-jwt (sync with cache)
   1.05x faster than RS512 - fast-jwt (async with cache)
   30.22x faster than RS512 - fast-jwt (sync)
   30.6x faster than RS512 - jose (sync)
   30.64x faster than RS512 - jsonwebtoken (async)
   31.03x faster than RS512 - jsonwebtoken (sync)
   77.79x faster than RS512 - fast-jwt (async)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.29 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)              55.21 µs/iter  55.37 µs   █                  
                             (54.69 µs … 56.85 µs)  55.52 µs ▅▅█ ▅  ▅    ▅ ▅ ▅ ▅ ▅
                           (  1.68 kb …   1.68 kb)   1.68 kb ███▁█▁▁█▁▁▁▁█▁█▁█▁█▁█

PS512 - fast-jwt (async)             86.37 µs/iter  86.79 µs  █                   
                              (83.13 µs … 1.75 ms) 106.92 µs ▅█▃                  
                           (  4.05 kb … 529.27 kb)   5.52 kb ███▇▅▄▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)    1.55 µs/iter   1.59 µs  █                   
                               (1.38 µs … 2.16 µs)   2.08 µs ██                   
                           (904.31  b …   0.98 kb) 914.85  b ██▃▁▂▁▂▂▁▁▂▁▁▁▁▁▁▃█▃▂

PS512 - fast-jwt (async with cache)   1.66 µs/iter   1.82 µs  █             ▂     
                               (1.50 µs … 1.96 µs)   1.91 µs ██             █▃    
                           (  1.58 kb …   1.69 kb)   1.67 kb ██▅▅▁▂▁▁▁▁▁▂▁▁▂██▅▁▄▂

PS512 - jose (sync)                  56.25 µs/iter  55.88 µs ▅█                   
                            (54.79 µs … 697.29 µs)  67.08 µs ██                   
                           (  2.19 kb … 355.05 kb)   3.45 kb ██▇▂▂▂▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)          57.72 µs/iter  57.80 µs █                    
                             (57.09 µs … 59.64 µs)  58.92 µs █   █   █            
                           (  1.38 kb …   1.38 kb)   1.38 kb █▁████▁▁█▁▁▁▁▁▁▁▁▁▁▁█

PS512 - jsonwebtoken (async)         58.79 µs/iter  57.85 µs █  █                 
                             (57.22 µs … 71.55 µs)  58.67 µs █ ▅█▅ ▅▅ ▅▅         ▅
                           (338.54  b … 339.49  b) 338.86  b █▁███▁██▁██▁▁▁▁▁▁▁▁▁█

summary
  PS512 - fast-jwt (sync with cache)
   1.07x faster than PS512 - fast-jwt (async with cache)
   35.55x faster than PS512 - fast-jwt (sync)
   36.22x faster than PS512 - jose (sync)
   37.17x faster than PS512 - jsonwebtoken (sync)
   37.86x faster than PS512 - jsonwebtoken (async)
   55.62x faster than PS512 - fast-jwt (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.30 GHz
cpu: Apple M2 Pro
runtime: node 22.11.0 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)              79.50 µs/iter  79.42 µs  █                   
                            (77.42 µs … 178.92 µs)  92.92 µs ██                   
                           (  1.63 kb … 400.78 kb)   2.45 kb ██▅▂▂▅▃▂▁▂▂▁▂▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)            122.41 µs/iter 123.63 µs  █                   
                           (119.04 µs … 193.75 µs) 138.83 µs ▂█                   
                           (  3.53 kb … 580.81 kb)   4.51 kb ██▆▃▆▅▃▃▂▂▂▂▁▁▂▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)    1.27 µs/iter   1.56 µs  █                   
                               (1.08 µs … 1.83 µs)   1.80 µs ▂█                   
                           (733.41  b …   1.52 kb)   1.07 kb ███▁▂▂▁▂▁▁▁▁▁▂▅▇▄▂▁▁▁

EdDSA - fast-jwt (async with cache)   1.55 µs/iter   1.61 µs █  ▄                 
                               (1.21 µs … 3.33 µs)   3.17 µs █▅ █▂▂               
                           (  1.75 kb …   1.86 kb)   1.84 kb ██▅███▅▃▂▁▁▃▁▁▂▁▂▂▁▁▂

EdDSA - jose (sync)                  81.76 µs/iter  82.25 µs █                    
                            (77.92 µs … 594.29 µs) 108.92 µs █                    
                           (  2.15 kb … 482.91 kb)   3.17 kb █▇▇▇▃▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.22x faster than EdDSA - fast-jwt (async with cache)
   62.78x faster than EdDSA - fast-jwt (sync)
   64.57x faster than EdDSA - jose (sync)
   96.68x faster than EdDSA - fast-jwt (async)
```
</details>

