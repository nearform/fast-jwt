# Benchmarks

Made with [mitata](https://github.com/evanwashere/mitata) library

## Signing


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (sync)                     3.38 µs/iter   2.79 µs █                    
                                 (2.54 µs … 2.71 ms)  10.00 µs ██                   
                             (512.00  b …   1.11 mb)   2.98 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)           215.47 µs/iter 216.58 µs     █▃               
                             (205.42 µs … 395.25 µs) 243.00 µs    ▃██▇              
                             (  5.55 kb … 872.74 kb)   8.67 kb ▁▂▅████▇▃▂▂▂▂▂▁▁▁▁▁▁▁

HS512 - jsonwebtoken (async)          219.23 µs/iter 219.83 µs   █ ▄                
                             (206.46 µs … 544.50 µs) 261.58 µs   █▄█                
                             (  8.85 kb … 666.63 kb)  13.68 kb ▂▅████▅▃▂▂▂▁▂▄▂▂▁▁▁▁▁

HS512 - fast-jwt (sync)                 2.28 µs/iter   2.41 µs  █                   
                                 (2.15 µs … 2.54 µs)   2.52 µs  █                   
                             (  1.60 kb …   1.60 kb)   1.60 kb ▅█▆▁▂▄▂▁▁▁▁▁▁███▁▂▁▁▂

HS512 - fast-jwt (async)                3.72 µs/iter   3.77 µs          █           
                                 (3.26 µs … 4.16 µs)   4.11 µs          █           
                             (  3.50 kb …   3.61 kb)   3.58 kb ▂▁▁▁▂▁▁▁██▅▂▄▄▂▄▂▁▂▂▄

HS512 - @node-rs/jsonwebtoken (sync)    2.74 µs/iter   2.74 µs    █   ▅█            
                                 (2.71 µs … 2.79 µs)   2.78 µs ▂ ▇█ ▇▅██ ▇▂         
                             (  1.31 kb …   1.31 kb)   1.31 kb █▄██▄████▄██▇▄▁▁▄▄▄▁▄

HS512 - @node-rs/jsonwebtoken (async)  12.25 µs/iter  13.00 µs               █▃     
                               (8.08 µs … 165.25 µs)  14.88 µs          ▅▂  ▃██     
                             (  2.27 kb … 194.30 kb)   2.71 kb ▁▁▁▁▂▃▅▅▅██▅████▆▃▂▁▁

summary
  HS512 - fast-jwt (sync)
   1.2x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.48x faster than HS512 - jose (sync)
   1.63x faster than HS512 - fast-jwt (async)
   5.38x faster than HS512 - @node-rs/jsonwebtoken (async)
   94.58x faster than HS512 - jsonwebtoken (sync)
   96.23x faster than HS512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
ES512 - jose (sync)                     1.02 ms/iter   1.02 ms  █                   
                                 (1.01 ms … 1.20 ms)   1.10 ms  █                   
                             (  3.27 kb …   1.22 mb)   7.85 kb ▄██▄▅▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (sync)             1.29 ms/iter   1.29 ms  █                   
                                 (1.27 ms … 1.59 ms)   1.44 ms  █▂                  
                             (  6.27 kb …  55.82 kb)   7.77 kb ▅██▅▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (async)            1.29 ms/iter   1.29 ms   █▆█                
                                 (1.28 ms … 1.51 ms)   1.33 ms  ▅███▆▃              
                             (  9.73 kb …   1.34 mb)  20.75 kb ▃██████▆▆▆▃▂▂▂▃▂▁▂▁▂▁

ES512 - fast-jwt (sync)                 1.02 ms/iter   1.02 ms  █                   
                                 (1.01 ms … 1.15 ms)   1.11 ms  █                   
                             (  2.44 kb … 964.06 kb)   5.62 kb ▅█▇▄▅▃▂▃▂▂▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async)                1.26 ms/iter   1.27 ms   █                  
                                 (1.25 ms … 1.46 ms)   1.35 ms  ▇█▂                 
                             (  4.84 kb …   1.47 mb)  10.78 kb ▂███▇▅▃▄▂▂▂▁▁▁▁▁▁▁▁▁▁

ES512 - @node-rs/jsonwebtoken (sync)    2.45 µs/iter   2.46 µs   █▄ ▂               
                                 (2.42 µs … 2.55 µs)   2.55 µs   ████ ▅             
                             (  1.27 kb …   1.27 kb)   1.27 kb ▃███████▅▃▃▃▃▅▃▃▁▁▁▁▃

ES512 - @node-rs/jsonwebtoken (async)   9.66 µs/iter   9.56 µs  █  ▂                
                                (9.38 µs … 11.13 µs)  10.37 µs ▅█▅ █                
                             (  2.17 kb …   2.27 kb)   2.19 kb ███▇█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▇

summary
  ES512 - @node-rs/jsonwebtoken (sync)
   3.94x faster than ES512 - @node-rs/jsonwebtoken (async)
   414.79x faster than ES512 - jose (sync)
   416.47x faster than ES512 - fast-jwt (sync)
   516.09x faster than ES512 - fast-jwt (async)
   525.83x faster than ES512 - jsonwebtoken (async)
   526.37x faster than ES512 - jsonwebtoken (sync)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.79 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (sync)                     2.55 ms/iter   2.53 ms █                    
                                 (2.51 ms … 3.15 ms)   3.13 ms █▄                   
                             (  4.82 kb …  12.66 kb)   4.91 kb ██▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - jsonwebtoken (sync)             3.44 ms/iter   3.41 ms  █                   
                                 (3.36 ms … 3.91 ms)   3.87 ms  █                   
                             (  8.89 kb …  10.02 kb)   9.14 kb ▇█▇▂▂▁▁▁▁▁▁▂▂▂▁▁▂▁▁▁▁

RS512 - jsonwebtoken (async)            3.41 ms/iter   3.40 ms  █                   
                                 (3.37 ms … 3.85 ms)   3.78 ms  █▃                  
                             ( 12.83 kb …  61.20 kb)  13.62 kb ▄██▃▂▂▁▁▁▁▂▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (sync)                 2.54 ms/iter   2.53 ms █                    
                                 (2.51 ms … 3.13 ms)   3.12 ms █▂                   
                             (  4.39 kb …  52.62 kb)   4.63 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - fast-jwt (async)                3.38 ms/iter   3.39 ms    ▂ ▄ ▆█            
                                 (3.35 ms … 3.55 ms)   3.42 ms   ▆█▆████▇▇▆▅▆       
                             (  9.82 kb …  12.52 kb)   9.96 kb ▄▇████████████▇▅▂▄▂▃▂

RS512 - @node-rs/jsonwebtoken (sync)    2.44 ms/iter   2.44 ms  █                   
                                 (2.42 ms … 2.55 ms)   2.48 ms  █▆▄                 
                             (  2.02 kb …   2.28 kb)   2.02 kb ████▇█▇▇▃▂▃▂▂▂▁▂▁▁▁▁▂

RS512 - @node-rs/jsonwebtoken (async)   2.45 ms/iter   2.46 ms   █▄                 
                                 (2.44 ms … 2.59 ms)   2.50 ms  ▂██▂▂ ▂             
                             (  3.05 kb …   3.11 kb)   3.06 kb ▂███████▄▄▂▃▂▂▁▂▁▁▁▁▁

summary
  RS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than RS512 - @node-rs/jsonwebtoken (async)
   1.04x faster than RS512 - fast-jwt (sync)
   1.05x faster than RS512 - jose (sync)
   1.39x faster than RS512 - fast-jwt (async)
   1.4x faster than RS512 - jsonwebtoken (async)
   1.41x faster than RS512 - jsonwebtoken (sync)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.79 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (sync)                     2.55 ms/iter   2.53 ms █                    
                                 (2.52 ms … 3.13 ms)   3.12 ms █▃                   
                             (  4.91 kb …   5.83 kb)   4.95 kb ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)             3.38 ms/iter   3.39 ms   █▇ ▄               
                                 (3.36 ms … 3.59 ms)   3.46 ms  ▆██▇██▇             
                             (  7.66 kb …  10.61 kb)   8.97 kb ▇███████▄▄▄▁▃▁▁▂▁▁▂▂▂

PS512 - jsonwebtoken (async)            3.39 ms/iter   3.39 ms  ▅▇█▅                
                                 (3.36 ms … 3.62 ms)   3.50 ms  ████▆               
                             ( 11.73 kb …  61.22 kb)  14.44 kb ██████▇▇▃▂▂▂▁▂▁▂▃▁▂▁▂

PS512 - fast-jwt (sync)                 2.58 ms/iter   2.54 ms █                    
                                 (2.52 ms … 3.18 ms)   3.12 ms █▄                   
                             (  3.75 kb …  37.74 kb)   4.57 kb ██▂▂▁▁▁▂▁▁▂▁▁▁▁▁▁▁▁▁▂

PS512 - fast-jwt (async)                3.38 ms/iter   3.38 ms      █ ▆             
                                 (3.35 ms … 3.55 ms)   3.43 ms   ▅█▇███▅▅ ▄         
                             (  9.08 kb …   1.19 mb)  15.53 kb ▅▇██████████▆▆▂▂▂▁▁▁▃

PS512 - @node-rs/jsonwebtoken (sync)    2.44 ms/iter   2.44 ms   █                  
                                 (2.43 ms … 2.51 ms)   2.50 ms  ▄█▄ ▂               
                             (  2.02 kb …   2.28 kb)   2.03 kb ▃█████▆▅▃▃▃▃▁▁▁▁▁▁▁▁▁

PS512 - @node-rs/jsonwebtoken (async)   2.46 ms/iter   2.46 ms   █                  
                                 (2.44 ms … 2.54 ms)   2.50 ms   █▆                 
                             (  3.05 kb …   3.11 kb)   3.06 kb ▃████▆▇█▃▃▃▃▃▂▂▁▂▁▁▁▁

summary
  PS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than PS512 - @node-rs/jsonwebtoken (async)
   1.04x faster than PS512 - jose (sync)
   1.06x faster than PS512 - fast-jwt (sync)
   1.38x faster than PS512 - fast-jwt (async)
   1.39x faster than PS512 - jsonwebtoken (sync)
   1.39x faster than PS512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (sync)                    25.41 µs/iter  25.42 µs             █        
                               (24.79 µs … 26.79 µs)  25.70 µs            ▅█        
                             (  3.23 kb …   3.23 kb)   3.23 kb ▇▇▁▁▁▁▁▁▁▁▁██▁▇▁▇▁▁▁▇

EdDSA - fast-jwt (sync)                24.91 µs/iter  25.18 µs ██              ██   
                               (24.41 µs … 26.19 µs)  25.33 µs ██▅▅            ██  ▅
                             (  1.89 kb …   1.90 kb)   1.89 kb ████▁▁▁▁▁▁▁▁▁▁▁▁██▁▁█

EdDSA - fast-jwt (async)              256.76 µs/iter 257.75 µs     █                
                             (248.67 µs … 317.42 µs) 281.33 µs    ▆█▆▂              
                             (  4.02 kb … 923.08 kb)   6.25 kb ▁▄█████▅▃▂▂▂▂▂▂▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)    2.34 µs/iter   2.35 µs   ▅█                 
                                 (2.32 µs … 2.39 µs)   2.38 µs  ▃██▆█▃   ▆▃         
                             (  1.27 kb …   1.27 kb)   1.27 kb █████████▁██▆▄█▆▁▄█▁▆

EdDSA - @node-rs/jsonwebtoken (async)   9.33 µs/iter   9.24 µs   █                  
                                (9.11 µs … 11.15 µs)   9.38 µs   █   ▅              
                             (  2.17 kb …   2.27 kb)   2.19 kb ▇▁█▇▇▁█▇▁▁▇▇▁▁▁▇▁▁▁▁▇

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   3.98x faster than EdDSA - @node-rs/jsonwebtoken (async)
   10.64x faster than EdDSA - fast-jwt (sync)
   10.86x faster than EdDSA - jose (sync)
   109.69x faster than EdDSA - fast-jwt (async)
```
</details>


## Decoding


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                893.09 ns/iter 896.06 ns   █▂▄▃               
                       (876.80 ns … 961.78 ns) 936.22 ns  ▃████               
                       (397.36  b … 458.22  b) 457.69  b ▂███████▃▄▆▂▂▂▃▃▁▂▂▂▂

RS512 - fast-jwt (complete)     906.11 ns/iter 908.55 ns   ▃█                 
                         (884.05 ns … 1.00 µs) 980.99 ns  ▇██▇▅               
                       (366.50  b … 578.24  b) 576.76  b ▆█████▃█▅▃▂▂▁▂▂▂▁▂▃▁▃

RS512 - jsonwebtoken              1.53 µs/iter   1.54 µs    █ ▄▃              
                           (1.51 µs … 1.58 µs)   1.57 µs  ▂██▄██▅▄ ▂▇ ▂       
                       (857.28  b … 867.14  b) 866.93  b ▆████████▃██▆█▃▆█▅▅▃▃

RS512 - jsonwebtoken (complete)   1.54 µs/iter   1.55 µs   ▂▂▆█▂▆▄  ▄         
                           (1.52 µs … 1.60 µs)   1.58 µs   ███████▃▃█         
                       (858.68  b … 891.18  b) 874.72  b ▇███████████▅██▁▇▃▃▁▃

RS512 - jose                    708.93 ns/iter 712.29 ns     ▂▅▅█▇            
                       (689.21 ns … 760.77 ns) 744.08 ns   ▂▇█████▂           
                       (426.12  b … 440.21  b) 435.80  b ▃▄█████████▃▆▅▁▂▄▂▅▃▂

RS512 - jose (complete)         696.39 ns/iter 698.70 ns       ▇▆█            
                       (679.14 ns … 740.70 ns) 725.55 ns      ████▃           
                       (414.45  b … 446.12  b) 439.94  b ▄▅▆▄██████▄▃▃▅▃▃▃▄▂▁▂

summary
  RS512 - jose (complete)
   1.02x faster than RS512 - jose
   1.28x faster than RS512 - fast-jwt
   1.3x faster than RS512 - fast-jwt (complete)
   2.2x faster than RS512 - jsonwebtoken
   2.21x faster than RS512 - jsonwebtoken (complete)
```
</details>


Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.73 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)               2.95 µs/iter   3.95 µs █                    
                               (2.46 µs … 4.06 µs)   4.05 µs █                    
                           (  1.26 kb …   1.26 kb)   1.26 kb █▂▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▇▄

HS512 - fast-jwt (async)              5.17 µs/iter   5.32 µs                   █  
                               (4.08 µs … 5.42 µs)   5.37 µs                   █▅▂
                           (  3.40 kb …   3.51 kb)   3.47 kb ▅▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃███

HS512 - fast-jwt (sync with cache)    1.13 µs/iter 934.96 ns █                    
                             (875.50 ns … 2.30 µs)   2.24 µs █▆                   
                           (481.93  b …   1.25 kb) 715.73  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▆▃

HS512 - fast-jwt (async with cache)   1.23 µs/iter   1.57 µs █                    
                             (981.96 ns … 1.72 µs)   1.69 µs █▂               █   
                           (  1.35 kb …   2.06 kb)   1.47 kb ██▅▁▁▁▁▁▁▁▁▁▁▁▁▁▃█▃▂▂

HS512 - jose (sync)                   3.38 µs/iter   3.04 µs   █                  
                               (2.79 µs … 3.23 ms)   4.46 µs   █▆                 
                           (984.00  b … 685.12 kb)   2.32 kb ▁███▆▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)         218.80 µs/iter 220.38 µs     █                
                           (210.17 µs … 417.17 µs) 247.42 µs  ▂▂██▄▂              
                           (  5.43 kb …   1.12 mb)   8.54 kb ▂██████▆▄▃▂▂▂▂▁▁▁▁▁▁▁

HS512 - jsonwebtoken (async)        221.89 µs/iter 222.71 µs      █▄              
                           (211.58 µs … 306.29 µs) 245.29 µs     ▄██▂             
                           (  6.11 kb … 900.87 kb)   8.25 kb ▁▁▃▄████▆▃▂▂▁▂▁▂▁▁▁▁▁

summary
  HS512 - fast-jwt (sync with cache)
   1.08x faster than HS512 - fast-jwt (async with cache)
   2.61x faster than HS512 - fast-jwt (sync)
   3x faster than HS512 - jose (sync)
   4.57x faster than HS512 - fast-jwt (async)
   193.67x faster than HS512 - jsonwebtoken (sync)
   196.4x faster than HS512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)             844.43 µs/iter 848.08 µs   █▆                 
                           (827.17 µs … 971.42 µs) 904.96 µs   ██                 
                           (  2.09 kb … 554.78 kb)   3.60 kb ▁▂██▇▅▆▃▃▃▃▃▂▂▁▁▁▁▁▁▁

ES512 - fast-jwt (async)            919.47 µs/iter 920.67 µs          █           
                             (864.33 µs … 1.08 ms) 975.63 µs         ██           
                           (  4.25 kb … 925.87 kb)   8.12 kb ▁▁▁▁▁▁▁▂███▅▄▂▂▃▂▁▁▁▁

ES512 - fast-jwt (sync with cache)    1.16 µs/iter   1.04 µs   ▇ █                
                             (916.00 ns … 3.33 ms)   1.63 µs   █ █                
                           (736.00  b … 185.17 kb) 802.54  b ▁▂█▁██▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.30 µs/iter   1.13 µs    ██                
                            (1000.00 ns … 1.55 ms)   1.58 µs    ██                
                           (  1.45 kb … 129.47 kb)   1.80 kb ▁▄▁██▁█▃▁▂▂▁▁▁▁▁▁▁▁▁▁

ES512 - jose (sync)                 843.15 µs/iter 845.08 µs           █          
                           (776.83 µs … 955.50 µs) 898.54 µs           █          
                           (  2.40 kb … 883.02 kb)   4.57 kb ▁▁▁▁▁▁▁▁▁▃█▆▅▃▂▂▂▁▁▁▁

ES512 - jsonwebtoken (sync)         933.61 µs/iter 932.58 µs  █                   
                             (919.25 µs … 1.07 ms)   1.01 ms  █▄                  
                           (  4.48 kb … 805.50 kb)   7.20 kb ▆██▅▄▃▂▂▂▂▁▁▁▂▁▂▂▂▁▁▁

ES512 - jsonwebtoken (async)        936.71 µs/iter 941.42 µs         ▄█           
                             (857.46 µs … 1.14 ms)   1.02 ms         ██▂          
                           (  4.97 kb …   2.22 mb)  12.48 kb ▁▁▁▁▁▁▁▁███▆▄▄▂▂▂▂▁▁▁

summary
  ES512 - fast-jwt (sync with cache)
   1.12x faster than ES512 - fast-jwt (async with cache)
   724.79x faster than ES512 - jose (sync)
   725.88x faster than ES512 - fast-jwt (sync)
   790.39x faster than ES512 - fast-jwt (async)
   802.55x faster than ES512 - jsonwebtoken (sync)
   805.22x faster than ES512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.78 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)              42.73 µs/iter  42.78 µs               █      
                             (41.98 µs … 46.14 µs)  43.14 µs ▅▅▅▅ ▅▅ ▅  ▅  █     ▅
                           (  1.72 kb …   1.72 kb)   1.72 kb ████▁██▁█▁▁█▁▁█▁▁▁▁▁█

RS512 - fast-jwt (async)            124.25 µs/iter 124.42 µs   █▃                 
                           (120.33 µs … 195.92 µs) 141.38 µs  ▅██▃                
                           (  4.32 kb … 550.10 kb)   5.56 kb ▂████▅▄▂▂▁▁▁▂▁▁▁▂▁▁▁▁

RS512 - fast-jwt (sync with cache)    1.51 µs/iter   1.33 µs █▄                   
                               (1.26 µs … 2.64 µs)   2.60 µs ██                   
                           (711.93  b … 721.63  b) 721.37  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▅▄

RS512 - fast-jwt (async with cache)   1.61 µs/iter   1.96 µs ▄█                   
                               (1.36 µs … 2.12 µs)   2.05 µs ██               ▆▄  
                           (  1.38 kb …   1.48 kb)   1.47 kb ██▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁██▂▂

RS512 - jose (sync)                  42.74 µs/iter  42.58 µs  █                   
                              (41.71 µs … 1.05 ms)  51.42 µs ▄█                   
                           (  2.29 kb … 307.27 kb)   3.19 kb ██▇▃▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)         124.73 µs/iter 124.17 µs   █                  
                             (120.13 µs … 1.08 ms) 144.17 µs  ▃█                  
                           (776.00  b … 674.80 kb)   9.82 kb ▁███▅▃▂▁▁▁▁▁▁▂▂▂▁▁▁▁▁

RS512 - jsonwebtoken (async)        122.37 µs/iter 121.92 µs  ▂█                  
                             (119.75 µs … 2.06 ms) 136.04 µs  ██                  
                           (  5.16 kb … 145.44 kb)   8.91 kb ▂███▃▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   1.06x faster than RS512 - fast-jwt (async with cache)
   28.22x faster than RS512 - fast-jwt (sync)
   28.23x faster than RS512 - jose (sync)
   80.82x faster than RS512 - jsonwebtoken (async)
   82.07x faster than RS512 - fast-jwt (async)
   82.38x faster than RS512 - jsonwebtoken (sync)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)              44.14 µs/iter  44.14 µs ███ ███ █    █    ███
                             (43.61 µs … 47.06 µs)  44.21 µs ███ ███ █    █    ███
                           (  1.68 kb …   1.68 kb)   1.68 kb ███▁███▁█▁▁▁▁█▁▁▁▁███

PS512 - fast-jwt (async)             71.43 µs/iter  71.42 µs  █▆                  
                            (69.38 µs … 209.21 µs)  84.67 µs  ██                  
                           (  4.16 kb … 509.16 kb)   5.31 kb ▃███▃▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)    1.44 µs/iter   1.23 µs █                    
                               (1.19 µs … 2.56 µs)   2.55 µs █                    
                           (703.44  b … 713.17  b) 712.92  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▆▂

PS512 - fast-jwt (async with cache)   1.54 µs/iter   1.89 µs █▄              ▄    
                               (1.28 µs … 2.05 µs)   2.04 µs ██              █    
                           (  1.37 kb …   1.47 kb)   1.46 kb ██▆▃▃▂▂▁▁▁▁▁▁▁▁▁█▅▃▄▃

PS512 - jose (sync)                  44.31 µs/iter  44.38 µs  █                   
                            (43.38 µs … 104.29 µs)  52.79 µs  █▃                  
                           (576.00  b … 323.55 kb)   3.18 kb ███▆▃▂▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)          72.19 µs/iter  71.00 µs  █                   
                              (69.00 µs … 3.01 ms)  85.83 µs  █▇                  
                           (  8.16 kb … 772.30 kb)   9.35 kb ▃██▅▃▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)         72.44 µs/iter  71.29 µs  █                   
                              (69.46 µs … 2.75 ms)  86.54 µs  ██                  
                           (  8.70 kb … 473.93 kb)   9.18 kb ▂██▅▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   1.07x faster than PS512 - fast-jwt (async with cache)
   30.73x faster than PS512 - fast-jwt (sync)
   30.86x faster than PS512 - jose (sync)
   49.74x faster than PS512 - fast-jwt (async)
   50.27x faster than PS512 - jsonwebtoken (sync)
   50.44x faster than PS512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)              66.90 µs/iter  66.67 µs  █                   
                            (65.79 µs … 100.42 µs)  78.38 µs ▆█                   
                           (  1.56 kb … 421.55 kb)   2.21 kb ██▅▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)            108.86 µs/iter 108.75 µs  ▇█                  
                           (106.46 µs … 970.21 µs) 121.92 µs  ██                  
                           (  3.52 kb … 581.30 kb)   4.33 kb ▃███▄▅▃▃▂▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)    1.18 µs/iter 981.56 ns █                    
                             (925.77 ns … 2.07 µs)   2.03 µs █▅                   
                           (880.81  b … 890.38  b) 890.21  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▃

EdDSA - fast-jwt (async with cache)   1.27 µs/iter   1.55 µs █                ▅   
                               (1.05 µs … 1.70 µs)   1.63 µs █▄               █   
                           (  1.53 kb …   1.65 kb)   1.63 kb ██▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁█▅▁▂

EdDSA - jose (sync)                  67.02 µs/iter  66.83 µs  █                   
                             (66.04 µs … 97.04 µs)  78.04 µs ▆█                   
                           (  2.20 kb … 418.91 kb)   3.05 kb ██▆▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.08x faster than EdDSA - fast-jwt (async with cache)
   56.9x faster than EdDSA - fast-jwt (sync)
   57x faster than EdDSA - jose (sync)
   92.58x faster than EdDSA - fast-jwt (async)
```
</details>

