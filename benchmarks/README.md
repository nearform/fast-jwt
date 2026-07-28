# Benchmarks

Made with [mitata](https://github.com/evanwashere/mitata) library

Note that `@node-rs/jsonwebtoken` does not support ES512, so it is excluded from the ES512 comparisons,
and that `jose` has been promise based since v3, so it only appears in the asynchronous comparisons.

## Signing


<details>
    <summary>HS256</summary>

## HS256
```
clk: ~3.11 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS256 - jose (async)                   19.64 µs/iter  20.25 µs ▅█                   
                              (14.88 µs … 386.50 µs)  51.71 µs ███▃                 
                             (416.00  b …   1.36 mb)  13.70 kb ████▆▄▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (sync)             3.35 µs/iter   3.17 µs  █                   
                               (2.88 µs … 715.50 µs)   6.13 µs  █▆                  
                             ( 16.00  b …   1.30 mb)   4.14 kb ▁██▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (async)            5.34 µs/iter   5.97 µs  █                   
                                 (4.52 µs … 6.98 µs)   6.52 µs  █▇▇       ▂  ▂   ▂  
                             (  7.02 kb …   7.24 kb)   7.06 kb ▆███▆▆▁▆▁▆▆█▁▁█▆▆▆█▁▆

HS256 - fast-jwt (sync)                 2.31 µs/iter   2.32 µs  █▆█                 
                                 (2.18 µs … 2.85 µs)   2.84 µs ████▂▄               
                             (  1.10 kb …   2.06 kb)   1.52 kb ██████▆▃▁▃▁▁▁▁▁▁▅▁▁▃▆

HS256 - fast-jwt (async)                4.26 µs/iter   5.08 µs  █                   
                                 (3.65 µs … 5.75 µs)   5.60 µs  █                   
                             (  3.61 kb …   4.22 kb)   3.66 kb ███▆▃▁▁▁▁▁▁▁▁▁▃▃▃▆▅▃▃

HS256 - @node-rs/jsonwebtoken (sync)    2.80 µs/iter   2.82 µs         ██           
                                 (2.75 µs … 2.94 µs)   2.90 µs ██▅██▅██████         
                             (  1.24 kb …   1.25 kb)   1.25 kb ████████████▅▁▅▅▁▅▅▅▅

HS256 - @node-rs/jsonwebtoken (async)  12.65 µs/iter  12.59 µs      █ █             
                               (11.93 µs … 14.17 µs)  13.19 µs ▅   ▅█ █   ▅       ▅▅
                             (  1.69 kb …   1.84 kb)   1.72 kb █▁▁▁██▁█▁▁▁█▁▁▁▁▁▁▁██

summary
  HS256 - fast-jwt (sync)
   1.21x faster than HS256 - @node-rs/jsonwebtoken (sync)
   1.45x faster than HS256 - jsonwebtoken (sync)
   1.84x faster than HS256 - fast-jwt (async)
   2.31x faster than HS256 - jsonwebtoken (async)
   5.46x faster than HS256 - @node-rs/jsonwebtoken (async)
   8.48x faster than HS256 - jose (async)
```
</details>


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~2.98 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (async)                   19.51 µs/iter  20.21 µs  █                   
                              (15.54 µs … 543.00 µs)  44.71 µs  █▂▂                 
                             (136.00  b … 260.40 kb)  13.26 kb ▇███▆▃▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)             3.41 µs/iter   3.46 µs ▄  ██                
                                 (3.24 µs … 4.11 µs)   3.83 µs █████▅▅ ▅ ▅          
                             (  3.57 kb …   3.97 kb)   3.60 kb ███████████▁▅▁▁▁▁▅▅▁▅

HS512 - jsonwebtoken (async)            5.77 µs/iter   6.31 µs   █                  
                                 (4.74 µs … 7.24 µs)   7.00 µs ████ █ █ █   █    █ █
                             (  1.60 kb …   7.09 kb)   6.57 kb ████▁█▁███▁▁▁███▁██▁█

HS512 - fast-jwt (sync)                 2.81 µs/iter   2.86 µs   █                  
                                 (2.63 µs … 3.30 µs)   3.28 µs  ██▄                 
                             (  1.62 kb …   1.83 kb)   1.64 kb ▆████▅▆▆█▁▅▁▁▁▃▁▁▁▃▃█

HS512 - fast-jwt (async)                4.74 µs/iter   4.65 µs  █                   
                                 (4.22 µs … 6.12 µs)   6.11 µs ▆█                   
                             (  3.54 kb …   3.55 kb)   3.54 kb ██▇▃▅▃▁▁▁▁▁▁▃▁▁▁▁▃▅▃▅

HS512 - @node-rs/jsonwebtoken (sync)    3.57 µs/iter   3.59 µs               █      
                                 (3.51 µs … 3.63 µs)   3.63 µs       ▃  ▃ ▆▆ █      
                             (  1.28 kb …   1.29 kb)   1.29 kb █▄█▄███▄█████▄█▄▄▄▁▄█

HS512 - @node-rs/jsonwebtoken (async)  11.07 µs/iter  11.71 µs  █                   
                               (8.75 µs … 172.63 µs)  30.33 µs  █                   
                             (  2.13 kb … 237.41 kb)   2.27 kb ██▄▆▄▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  HS512 - fast-jwt (sync)
   1.21x faster than HS512 - jsonwebtoken (sync)
   1.27x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.68x faster than HS512 - fast-jwt (async)
   2.05x faster than HS512 - jsonwebtoken (async)
   3.93x faster than HS512 - @node-rs/jsonwebtoken (async)
   6.93x faster than HS512 - jose (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.10 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
ES512 - jose (async)           1.59 ms/iter   1.61 ms  █                   
                        (1.53 ms … 1.87 ms)   1.78 ms  █▂                  
                    ( 16.15 kb … 549.00 kb)  20.20 kb ███▆▆▅▅▅▄▄▂▃▃▂▂▁▁▂▁▁▂

ES512 - jsonwebtoken (sync)    1.58 ms/iter   1.60 ms ██                   
                        (1.51 ms … 2.07 ms)   1.97 ms ██▃▅                 
                    (  5.91 kb … 233.70 kb)   9.44 kb ████▇▅▄▄▂▂▂▂▂▂▂▁▁▁▁▁▁

ES512 - jsonwebtoken (async)   1.58 ms/iter   1.61 ms  █                   
                        (1.51 ms … 1.81 ms)   1.75 ms ▅█▅  ▂               
                    (  9.84 kb …   1.13 mb)  17.70 kb ███▇██▇▇▆▆▃▆▅▃▃▄▂▃▂▂▂

ES512 - fast-jwt (sync)        1.57 ms/iter   1.59 ms  █                   
                        (1.51 ms … 1.95 ms)   1.76 ms ▅█▄  ▂               
                    (  2.81 kb …  12.16 kb)   3.62 kb ███▅▆█▇▅▆▅▂▃▃▃▂▂▁▁▁▁▁

ES512 - fast-jwt (async)       1.61 ms/iter   1.64 ms  █                   
                        (1.54 ms … 1.93 ms)   1.78 ms ▃██ ▂▃▂▂             
                    (  5.27 kb … 249.05 kb)   8.12 kb ███▇████▇▆▅▆▄▅▄▂▃▁▃▂▂

summary
  ES512 - fast-jwt (sync)
   1.01x faster than ES512 - jsonwebtoken (async)
   1.01x faster than ES512 - jsonwebtoken (sync)
   1.01x faster than ES512 - jose (async)
   1.03x faster than ES512 - fast-jwt (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~2.77 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (async)                    3.60 ms/iter   3.58 ms █▄                   
                                 (3.35 ms … 8.40 ms)   7.20 ms ██                   
                             ( 20.45 kb … 292.09 kb)  23.92 kb ███▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)             3.43 ms/iter   3.48 ms ▂█                   
                                 (3.32 ms … 4.22 ms)   4.16 ms ██▅                  
                             (  8.17 kb …  81.59 kb)   8.71 kb █████▇▅▃▂▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (async)            3.50 ms/iter   3.54 ms ▂▇▆██                
                                 (3.33 ms … 4.31 ms)   4.29 ms █████▆               
                             ( 12.24 kb …   1.17 mb)  19.95 kb ███████▅▂▃▂▂▁▁▁▁▂▁▁▁▄

RS512 - fast-jwt (sync)                 3.45 ms/iter   3.50 ms ▆█▃                  
                                 (3.32 ms … 4.29 ms)   4.16 ms ███▂▅▃               
                             (  4.66 kb … 111.18 kb)   5.24 kb ██████▆▄▃▂▂▁▁▁▁▁▁▁▁▁▃

RS512 - fast-jwt (async)                4.24 ms/iter   4.26 ms   █                  
                                 (4.19 ms … 4.42 ms)   4.40 ms  ▅█▇▄                
                             ( 10.11 kb … 150.27 kb)  12.57 kb ▃█████▅▅▃▅▃▃▂▂▃▃▁▂▂▂▂

RS512 - @node-rs/jsonwebtoken (sync)    3.38 ms/iter   3.40 ms ▂█                   
                                 (3.35 ms … 3.57 ms)   3.53 ms ██                   
                             (  2.32 kb …   4.57 kb)   2.34 kb ██▇▄▄▂▅▃▂▂▂▂▃▁▃▂▂▁▁▂▁

RS512 - @node-rs/jsonwebtoken (async)   3.41 ms/iter   3.43 ms  █                   
                                 (3.36 ms … 3.66 ms)   3.56 ms ▃█▂                  
                             (  2.76 kb …   5.32 kb)   2.80 kb ████▆▃▄▄▃▃▁▁▁▃▃▃▃▂▂▂▂

summary
  RS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than RS512 - @node-rs/jsonwebtoken (async)
   1.01x faster than RS512 - jsonwebtoken (sync)
   1.02x faster than RS512 - fast-jwt (sync)
   1.03x faster than RS512 - jsonwebtoken (async)
   1.06x faster than RS512 - jose (async)
   1.25x faster than RS512 - fast-jwt (async)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.17 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (async)                    3.39 ms/iter   3.38 ms █                    
                                 (3.34 ms … 4.18 ms)   4.15 ms █                    
                             ( 21.15 kb … 361.93 kb)  24.60 kb ██▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)             3.40 ms/iter   3.39 ms █                    
                                 (3.32 ms … 4.15 ms)   4.13 ms █▃                   
                             (  7.21 kb … 114.42 kb)   9.45 kb ██▇▃▂▂▁▁▂▁▁▂▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)            3.37 ms/iter   3.35 ms █                    
                                 (3.32 ms … 4.16 ms)   4.14 ms █                    
                             ( 11.03 kb …   1.13 mb)  19.88 kb █▇▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync)                 3.38 ms/iter   3.37 ms █                    
                                 (3.33 ms … 4.21 ms)   4.16 ms █                    
                             (  4.15 kb …  77.84 kb)   5.04 kb █▇▃▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (async)                4.47 ms/iter   4.39 ms █                    
                                (4.19 ms … 13.96 ms)   8.78 ms █▃                   
                             (  9.51 kb …  83.58 kb)  11.82 kb ██▃▂▂▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - @node-rs/jsonwebtoken (sync)    3.42 ms/iter   3.45 ms ▆█                   
                                 (3.35 ms … 3.72 ms)   3.66 ms ██▂                  
                             (  2.32 kb …   2.55 kb)   2.32 kb ███▃▂▃▅▃▄▁▃▂▃▂▂▂▁▁▂▂▂

PS512 - @node-rs/jsonwebtoken (async)   3.47 ms/iter   3.53 ms █▅                   
                                 (3.37 ms … 4.04 ms)   3.85 ms ██                   
                             (  2.76 kb …   3.03 kb)   2.76 kb ██▅▆▇▄▂▃▃▄▃▅▂▁▂▁▂▄▂▁▂

summary
  PS512 - jsonwebtoken (async)
   1x faster than PS512 - fast-jwt (sync)
   1.01x faster than PS512 - jose (async)
   1.01x faster than PS512 - jsonwebtoken (sync)
   1.01x faster than PS512 - @node-rs/jsonwebtoken (sync)
   1.03x faster than PS512 - @node-rs/jsonwebtoken (async)
   1.33x faster than PS512 - fast-jwt (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.14 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (async)                   51.74 µs/iter  52.33 µs  ▅█                  
                              (45.67 µs … 222.46 µs)  84.46 µs  ██▇                 
                             (824.00  b … 354.77 kb)  14.72 kb ▂████▄▂▂▁▂▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync)                31.83 µs/iter  31.49 µs  █                   
                               (30.66 µs … 37.80 µs)  33.19 µs  █  █                
                             (  1.94 kb …   2.05 kb)   1.96 kb ███▁█▁██▁█▁▁▁▁▁▁▁▁▁▁█

EdDSA - fast-jwt (async)               74.70 µs/iter  75.04 µs ▄█ ▄                 
                              (71.42 µs … 347.29 µs)  95.63 µs ████                 
                             (  4.48 kb … 260.66 kb)   5.05 kb ████▇▆▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)   29.27 µs/iter  29.29 µs    █                 
                               (28.91 µs … 30.31 µs)  29.92 µs ▅  █                 
                             (  1.29 kb …   1.29 kb)   1.29 kb █▁▇█▁▁▇▇▁▁▁▇▁▁▁▁▁▁▁▁▇

EdDSA - @node-rs/jsonwebtoken (async)  40.63 µs/iter  40.75 µs   █                  
                              (36.04 µs … 129.42 µs)  66.67 µs   █▄                 
                             (  2.13 kb …  66.13 kb)   2.16 kb ▁▅██▅▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   1.09x faster than EdDSA - fast-jwt (sync)
   1.39x faster than EdDSA - @node-rs/jsonwebtoken (async)
   1.77x faster than EdDSA - jose (async)
   2.55x faster than EdDSA - fast-jwt (async)
```
</details>


## Decoding


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.14 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                  1.02 µs/iter   1.03 µs  █▄ ▂                
                         (996.30 ns … 1.14 µs)   1.13 µs  ██▄█ ▃              
                       (464.77  b … 476.07  b) 474.18  b █████▇█▇▅▄▅▂▂▂▁▂▁▂▁▁▂

RS512 - fast-jwt (complete)       1.03 µs/iter   1.03 µs  ██▆                 
                           (1.01 µs … 1.13 µs)   1.12 µs  ███▂ ▂              
                       (584.89  b … 596.21  b) 594.29  b ▇██████▂▅▃▃▂▂▂▂▂▂▁▁▁▂

RS512 - jsonwebtoken              1.73 µs/iter   1.75 µs ▄█▂                  
                           (1.69 µs … 1.82 µs)   1.79 µs ████▃▃▆█▆▃  █  ▃     
                       (670.47  b …   1.25 kb) 895.60  b ██████████▃██▇▃█▁█▁▁▃

RS512 - jsonwebtoken (complete)   1.75 µs/iter   1.77 µs  █ █ ▅               
                           (1.71 µs … 1.89 µs)   1.87 µs  █ █ █▇ █            
                       (704.28  b …   1.14 kb) 895.66  b ▃████████▆▆▄▃▃▆▁▃▁▁▁▃

RS512 - jose                    603.19 ns/iter 611.11 ns  █                   
                       (582.77 ns … 699.28 ns) 673.76 ns ▅███▃▂               
                       (338.62  b … 990.92  b) 570.96  b ███████▆█▅▄▃▂▃▂▁▁▂▁▂▁

RS512 - jose (complete)           1.15 µs/iter   1.16 µs   █▄                 
                           (1.12 µs … 1.24 µs)   1.23 µs  ▇██▅▅█ ▃            
                       (894.04  b …   1.40 kb)   1.07 kb ██████████▅▆▃▄▂▂▂▃▂▂▂

summary
  RS512 - jose
   1.7x faster than RS512 - fast-jwt
   1.7x faster than RS512 - fast-jwt (complete)
   1.91x faster than RS512 - jose (complete)
   2.86x faster than RS512 - jsonwebtoken
   2.91x faster than RS512 - jsonwebtoken (complete)
```
</details>


Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying


<details>
    <summary>HS256</summary>

## HS256
```
clk: ~3.14 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS256 - fast-jwt (sync)                 2.71 µs/iter   2.77 µs    █     ▅           
                                 (2.57 µs … 3.19 µs)   3.03 µs ██████▃█▃█           
                             (161.67  b …   1.49 kb)   1.30 kb ████████████▄▄▁▄▄▁▁▁▄

HS256 - fast-jwt (async)                5.70 µs/iter   6.36 µs █                    
                                 (4.77 µs … 7.28 µs)   7.15 µs █▂  ▂▂▂         ▂   ▂
                             (  1.87 kb …   3.90 kb)   3.49 kb ██▆▆███▆▁▆▁▁▆▆▆▁█▆▁▁█

HS256 - fast-jwt (sync with cache)      1.14 µs/iter   1.08 µs   ██                 
                               (958.00 ns … 5.19 ms)   1.88 µs   ██                 
                             (  1.37 kb … 241.84 kb)   1.42 kb ▁▂██▆▅▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - fast-jwt (async with cache)     1.27 µs/iter   1.20 µs █                    
                                 (1.14 µs … 2.28 µs)   2.24 µs █▆                   
                             (  1.14 kb …   2.45 kb)   1.76 kb ██▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▂▁

HS256 - jose (async)                   18.04 µs/iter  18.38 µs  █                   
                              (14.92 µs … 205.71 µs)  38.21 µs  █▅                  
                             (  3.03 kb … 801.94 kb)  12.47 kb ▄███▅▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (sync)             4.12 µs/iter   4.31 µs ▂▂█ ▂▂               
                                 (3.80 µs … 4.64 µs)   4.63 µs ███▅██▅ ▅  ▅   ▅     
                             (  3.10 kb …   4.05 kb)   3.55 kb ███████▇█▇▇█▇▇▇█▇▁▇▇▇

HS256 - jsonwebtoken (async)            4.23 µs/iter   4.32 µs    █                 
                                 (4.05 µs … 4.53 µs)   4.52 µs  ▃ █ ▆        █      
                             (  4.09 kb …   4.22 kb)   4.09 kb ▄█▄███▄█▄▄▄█▄██▁▁▁▁▁▄

HS256 - @node-rs/jsonwebtoken (sync)    3.29 µs/iter   3.34 µs        ▄█ ▄          
                                 (3.15 µs … 3.43 µs)   3.42 µs       ▅██▅██   ▅  ▅ █
                             (342.63  b … 352.32  b) 351.79  b █▅▁██▅██████▅▅▅█▁▅█▁█

HS256 - @node-rs/jsonwebtoken (async)  11.43 µs/iter  12.17 µs    █▃                
                               (7.71 µs … 224.25 µs)  21.50 µs    ██▄               
                             (  1.18 kb … 129.20 kb)   1.35 kb ▁▁█████▇▆▄▃▂▂▂▁▁▁▁▁▁▁

summary
  HS256 - fast-jwt (sync with cache)
   1.11x faster than HS256 - fast-jwt (async with cache)
   2.37x faster than HS256 - fast-jwt (sync)
   2.88x faster than HS256 - @node-rs/jsonwebtoken (sync)
   3.61x faster than HS256 - jsonwebtoken (sync)
   3.7x faster than HS256 - jsonwebtoken (async)
   4.99x faster than HS256 - fast-jwt (async)
   10x faster than HS256 - @node-rs/jsonwebtoken (async)
   15.78x faster than HS256 - jose (async)
```
</details>


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.12 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)                 2.93 µs/iter   2.97 µs  █    ▃              
                                 (2.79 µs … 3.23 µs)   3.21 µs ▆█▃  ██              
                             (  1.68 kb …   1.72 kb)   1.68 kb ███▄▆████▆▆▁▁▄█▁▆▄▄▁▄

HS512 - fast-jwt (async)                6.08 µs/iter   6.76 µs    █                 
                                 (5.25 µs … 7.65 µs)   7.55 µs  ▃ █                 
                             (975.46  b …   3.63 kb)   3.39 kb ████▄▁▄▁▄▁▁▁▄▄▁▄▄▄▄▁▄

HS512 - fast-jwt (sync with cache)      1.28 µs/iter   1.20 µs █                    
                                 (1.17 µs … 3.11 µs)   3.07 µs █                    
                             (797.67  b …   1.12 kb) 932.17  b █▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

HS512 - fast-jwt (async with cache)     1.44 µs/iter   1.36 µs █                    
                                 (1.31 µs … 2.49 µs)   2.41 µs █                    
                             (  1.50 kb …   1.75 kb)   1.63 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▃

HS512 - jose (async)                   19.27 µs/iter  19.79 µs  █                   
                              (14.83 µs … 646.42 µs)  45.79 µs  █▆                  
                             (  1.02 kb … 251.02 kb)  12.37 kb ▂███▆▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)             4.10 µs/iter   4.18 µs █ ▃ ▃                
                                 (3.90 µs … 4.77 µs)   4.54 µs █▇█▂█▂▂▇ ▇▇          
                             (  3.57 kb …   3.86 kb)   3.74 kb ████████▆██▆▆▁▁▁▆▆▁▁▆

HS512 - jsonwebtoken (async)            4.22 µs/iter   4.31 µs  █    ▄              
                                 (4.09 µs … 4.46 µs)   4.44 µs  ██  ██      ▅       
                             (  4.18 kb …   4.37 kb)   4.28 kb ▅██▅████▁▅▅▁▁█▅█▁▁▅▅▅

HS512 - @node-rs/jsonwebtoken (sync)    3.88 µs/iter   3.88 µs    █                 
                                 (3.80 µs … 4.99 µs)   3.95 µs   ██          ▃ ▃    
                             (342.53  b … 352.14  b) 351.72  b █████▄██▄███▁▁█▁█▁▁▄▄

HS512 - @node-rs/jsonwebtoken (async)  11.01 µs/iter  11.27 µs ██  █ ███    █  ███ █
                               (10.50 µs … 11.80 µs)  11.39 µs ██  █ ███    █  ███ █
                             (800.23  b … 804.08  b) 800.76  b ██▁▁█▁███▁▁▁▁█▁▁███▁█

summary
  HS512 - fast-jwt (sync with cache)
   1.12x faster than HS512 - fast-jwt (async with cache)
   2.29x faster than HS512 - fast-jwt (sync)
   3.03x faster than HS512 - @node-rs/jsonwebtoken (sync)
   3.2x faster than HS512 - jsonwebtoken (sync)
   3.29x faster than HS512 - jsonwebtoken (async)
   4.74x faster than HS512 - fast-jwt (async)
   8.6x faster than HS512 - @node-rs/jsonwebtoken (async)
   15.04x faster than HS512 - jose (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.14 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)               1.19 ms/iter   1.21 ms  █                   
                               (1.15 ms … 1.40 ms)   1.37 ms ██                   
                           (  2.55 kb … 608.43 kb)   5.24 kb ███▆▅▅▄▄▂▃▂▂▂▂▂▂▁▂▁▁▂

ES512 - fast-jwt (async)              1.20 ms/iter   1.21 ms  █                   
                               (1.18 ms … 1.41 ms)   1.36 ms ▃█                   
                           (  4.71 kb …   1.09 mb)   9.89 kb ███▆▅▃▃▃▂▁▂▁▁▂▁▁▁▁▁▁▁

ES512 - fast-jwt (sync with cache)    1.42 µs/iter   1.38 µs   █                  
                              (1.21 µs … 98.79 µs)   2.58 µs   █                  
                           (  1.27 kb … 169.33 kb)   1.29 kb ▁▄█▃▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.69 µs/iter   1.54 µs  █                   
                               (1.38 µs … 1.62 ms)   4.08 µs  █                   
                           (  2.00 kb …  82.02 kb)   2.14 kb ▁█▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - jose (async)                  1.44 ms/iter   1.32 ms █                    
                               (1.18 ms … 4.31 ms)   4.00 ms █▂                   
                           ( 14.33 kb … 590.42 kb)  16.25 kb ██▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (sync)           1.18 ms/iter   1.19 ms  █                   
                               (1.15 ms … 1.41 ms)   1.33 ms ▇█▂                  
                           (  3.95 kb … 387.63 kb)   5.61 kb ███▇▄▄▄▃▃▃▃▂▁▁▂▁▁▂▂▁▁

ES512 - jsonwebtoken (async)          1.18 ms/iter   1.18 ms  █                   
                               (1.15 ms … 1.35 ms)   1.29 ms ▂█                   
                           (  4.55 kb … 144.52 kb)   5.06 kb ███▆▅▃▄▃▃▃▂▂▁▂▂▁▁▁▁▁▁

summary
  ES512 - fast-jwt (sync with cache)
   1.19x faster than ES512 - fast-jwt (async with cache)
   829.71x faster than ES512 - jsonwebtoken (async)
   834.56x faster than ES512 - jsonwebtoken (sync)
   839.01x faster than ES512 - fast-jwt (sync)
   848.48x faster than ES512 - fast-jwt (async)
   1014.45x faster than ES512 - jose (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.12 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)                58.53 µs/iter  58.67 µs  █                   
                              (55.17 µs … 445.67 µs)  82.21 µs  █▃                  
                             (  1.91 kb … 248.52 kb)   2.91 kb ▇███▄▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)               92.91 µs/iter  92.88 µs ▅█                   
                              (89.25 µs … 242.79 µs) 122.67 µs ███                  
                             (944.00  b … 260.76 kb)   5.88 kb ███▆▄▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (sync with cache)      1.86 µs/iter   1.78 µs ▆█                   
                                 (1.69 µs … 3.05 µs)   2.99 µs ██                   
                             (394.48  b … 826.47  b) 757.46  b ███▂▁▁▂▁▁▁▁▁▁▁▁▁▁▂▂▂▂

RS512 - fast-jwt (async with cache)     2.04 µs/iter   2.00 µs █▆                   
                                 (1.85 µs … 3.75 µs)   3.37 µs ██                   
                             (  1.34 kb …   1.53 kb)   1.44 kb ██▃▆▃▃▁▂▁▁▁▁▁▂▁▁▁▃▁▁▂

RS512 - jose (async)                   80.24 µs/iter  79.79 µs  █                   
                              (74.88 µs … 309.29 µs) 120.42 µs ▄█                   
                             (760.00  b … 857.20 kb)  15.81 kb ███▄▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)            60.44 µs/iter  60.50 µs  █                   
                              (57.63 µs … 287.04 µs)  82.83 µs  █                   
                             (  1.95 kb … 359.95 kb)   9.17 kb ▅█▇▄▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (async)           58.92 µs/iter  58.97 µs █ ██  ███ █ ██     ██
                               (58.34 µs … 60.36 µs)  59.34 µs █ ██  ███ █ ██     ██
                             (  8.32 kb …   8.32 kb)   8.32 kb █▁██▁▁███▁█▁██▁▁▁▁▁██

RS512 - @node-rs/jsonwebtoken (sync)   78.43 µs/iter  77.92 µs █                    
                              (76.46 µs … 183.50 µs) 102.17 µs █                    
                             (352.00  b … 172.74 kb) 712.87  b █▃▅▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - @node-rs/jsonwebtoken (async)  90.38 µs/iter  90.21 µs  █                   
                              (86.67 µs … 191.17 µs) 119.67 µs ▃█                   
                             (848.00  b … 128.83 kb)   1.21 kb ██▇▄▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   1.1x faster than RS512 - fast-jwt (async with cache)
   31.54x faster than RS512 - fast-jwt (sync)
   31.75x faster than RS512 - jsonwebtoken (async)
   32.56x faster than RS512 - jsonwebtoken (sync)
   42.26x faster than RS512 - @node-rs/jsonwebtoken (sync)
   43.24x faster than RS512 - jose (async)
   48.7x faster than RS512 - @node-rs/jsonwebtoken (async)
   50.06x faster than RS512 - fast-jwt (async)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.16 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)                58.28 µs/iter  58.20 µs        █             
                               (57.44 µs … 60.77 µs)  59.05 µs        █ █           
                             ( 46.69  b …   1.98 kb)   1.53 kb █▁▁███▁█▁█▁█▁▁▁▁▁▁▁▁█

PS512 - fast-jwt (async)               93.95 µs/iter  94.13 µs  █                   
                              (89.92 µs … 471.79 µs) 123.58 µs ▇█▆                  
                             (  4.38 kb … 292.57 kb)   5.53 kb ███▇▄▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)      1.73 µs/iter   1.64 µs  █                   
                                 (1.56 µs … 2.91 µs)   2.88 µs ▅█                   
                             (654.78  b …   1.05 kb) 759.15  b ██▄▁▁▂▂▁▁▁▁▁▁▁▁▁▁▁▂▁▃

PS512 - fast-jwt (async with cache)     1.87 µs/iter   1.81 µs ▃█                   
                                 (1.70 µs … 3.03 µs)   3.02 µs ██▂                  
                             (  1.42 kb …   1.61 kb)   1.45 kb ███▂▁▄▁▁▁▁▁▂▁▁▁▁▁▂▁▂▂

PS512 - jose (async)                   82.34 µs/iter  82.21 µs ▂█                   
                              (77.67 µs … 327.38 µs) 119.42 µs ██                   
                             (736.00  b … 320.68 kb)  18.02 kb ███▅▄▂▂▂▂▁▂▁▂▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)            61.25 µs/iter  61.46 µs  █                   
                              (58.92 µs … 189.88 µs)  81.79 µs  █                   
                             (  0.00  b … 515.94 kb)   9.36 kb ▄█▅▅▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)           62.41 µs/iter  62.49 µs  █            █      
                               (60.45 µs … 71.51 µs)  62.91 µs ▅█ ▅▅     ▅   █  ▅▅ ▅
                             (  8.24 kb …   8.24 kb)   8.24 kb ██▁██▁▁▁▁▁█▁▁▁█▁▁██▁█

PS512 - @node-rs/jsonwebtoken (sync)   79.79 µs/iter  80.21 µs █                    
                              (77.46 µs … 181.00 µs) 107.42 µs █                    
                             (328.00  b … 261.52 kb) 711.33  b █▂▇▂▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - @node-rs/jsonwebtoken (async)  91.47 µs/iter  91.21 µs █                    
                              (87.75 µs … 207.04 µs) 122.75 µs ██                   
                             (824.00  b … 128.80 kb)   1.15 kb ███▄▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   1.08x faster than PS512 - fast-jwt (async with cache)
   33.6x faster than PS512 - fast-jwt (sync)
   35.31x faster than PS512 - jsonwebtoken (sync)
   35.98x faster than PS512 - jsonwebtoken (async)
   46x faster than PS512 - @node-rs/jsonwebtoken (sync)
   47.48x faster than PS512 - jose (async)
   52.74x faster than PS512 - @node-rs/jsonwebtoken (async)
   54.17x faster than PS512 - fast-jwt (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~2.96 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)                85.41 µs/iter  85.08 µs  █                   
                              (84.21 µs … 126.54 µs)  94.46 µs  █                   
                             (  1.64 kb … 238.07 kb)   2.34 kb ▄█▅▂▁▁▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)               96.15 µs/iter  96.46 µs  █                   
                              (93.79 µs … 220.50 µs) 111.33 µs  █▃                  
                             (  3.61 kb … 259.76 kb)   4.95 kb ▅██▄▅▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)      1.32 µs/iter   1.22 µs █                    
                                 (1.19 µs … 2.17 µs)   2.15 µs █                    
                             (855.55  b …   1.03 kb) 932.55  b ██▁▁▁▁▁▂▁▁▁▁▁▁▁▁▁▁▁▁▄

EdDSA - fast-jwt (async with cache)     1.50 µs/iter   1.43 µs  █                   
                                 (1.35 µs … 2.64 µs)   2.49 µs ▇█                   
                             (  1.50 kb …   1.75 kb)   1.63 kb ██▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▂

EdDSA - jose (async)                  105.00 µs/iter 104.83 µs  █                   
                             (101.46 µs … 271.96 µs) 133.75 µs  █                   
                             (  3.28 kb … 599.28 kb)  13.30 kb ▆█▇▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)   41.16 µs/iter  41.19 µs       █              
                               (40.91 µs … 42.21 µs)  41.26 µs ▅▅▅ ▅ █   ▅    ▅▅ ▅ ▅
                             (352.02  b … 352.04  b) 352.03  b ███▁█▁█▁▁▁█▁▁▁▁██▁█▁█

EdDSA - @node-rs/jsonwebtoken (async)  52.45 µs/iter  52.58 µs   █                  
                              (48.13 µs … 138.33 µs)  73.04 µs   ██                 
                             (848.00  b …  64.83 kb)   1.18 kb ▁▁██▆▆▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.14x faster than EdDSA - fast-jwt (async with cache)
   31.21x faster than EdDSA - @node-rs/jsonwebtoken (sync)
   39.76x faster than EdDSA - @node-rs/jsonwebtoken (async)
   64.75x faster than EdDSA - fast-jwt (sync)
   72.89x faster than EdDSA - fast-jwt (async)
   79.6x faster than EdDSA - jose (async)
```
</details>

