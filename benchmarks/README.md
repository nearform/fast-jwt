# Benchmarks

Made with [mitata](https://github.com/evanwashere/mitata) library

## Signing


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (sync)                     3.29 µs/iter   2.75 µs  █                   
                                 (2.54 µs … 2.61 ms)   6.08 µs  █                   
                             (512.00  b …   1.03 mb)   2.97 kb ▅█▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)           215.65 µs/iter 217.63 µs   ▂█                 
                             (206.17 µs … 493.79 µs) 250.21 µs  ▄██▃█▃              
                             (  5.55 kb … 788.38 kb)   8.87 kb ▁██████▆▃▂▂▂▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (async)          212.88 µs/iter 212.75 µs    █                 
                             (204.54 µs … 338.88 µs) 245.46 µs    █                 
                             (  5.73 kb … 574.96 kb)   6.23 kb ▂▃██▆▄▂▂▁▂▂▂▁▁▁▁▁▁▁▁▁

HS512 - fast-jwt (sync)                 2.31 µs/iter   2.45 µs  █                   
                                 (2.19 µs … 2.47 µs)   2.47 µs  █▇                ▇▂
                             (  1.57 kb …   1.57 kb)   1.57 kb ▃███▁▁▁▁▁▁▁▁▁▁▁▁▁▂███

HS512 - fast-jwt (async)                3.93 µs/iter   3.93 µs  █                   
                                 (3.78 µs … 4.53 µs)   4.35 µs ▃█▃▃                 
                             (700.39  b …   3.52 kb)   1.36 kb ████▅▃▃▁▁▅▁▃▁▃▁▃▃▁▁▃▃

HS512 - @node-rs/jsonwebtoken (sync)    2.80 µs/iter   2.79 µs     █                
                               (2.62 µs … 123.29 µs)   3.29 µs   ▃ █▃               
                             (  1.33 kb …  97.41 kb)   1.38 kb ▁▃█▆██▄▃▁▅▅▂▁▁▁▁▁▁▁▁▁

HS512 - @node-rs/jsonwebtoken (async)  12.04 µs/iter  12.88 µs                █     
                               (8.13 µs … 127.04 µs)  14.46 µs          ▄▂   ▇█▂    
                             (  1.84 kb … 129.84 kb)   2.26 kb ▁▁▂▁▃▃▄▄▃██▄▇▆███▃▁▁▁

summary
  HS512 - fast-jwt (sync)
   1.21x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.42x faster than HS512 - jose (sync)
   1.7x faster than HS512 - fast-jwt (async)
   5.21x faster than HS512 - @node-rs/jsonwebtoken (async)
   92.19x faster than HS512 - jsonwebtoken (async)
   93.39x faster than HS512 - jsonwebtoken (sync)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
ES512 - jose (sync)                     1.09 ms/iter   1.11 ms       █    ▂         
                                 (1.03 ms … 1.20 ms)   1.17 ms      ▃█▄▂▃▅█         
                             (  3.27 kb …   1.29 mb)   8.53 kb ▃▆█▇▇████████▄▄▂▂▃▁▂▁

ES512 - jsonwebtoken (sync)             1.37 ms/iter   1.39 ms     █▄       ▂▇      
                                 (1.34 ms … 1.55 ms)   1.41 ms    ▇███▇     ██▇     
                             (  6.05 kb …  55.27 kb)   7.75 kb ▁▁▅██████▆▄▄▆████▇▅▁▁

ES512 - jsonwebtoken (async)            1.38 ms/iter   1.39 ms        ▅   █▄        
                                 (1.30 ms … 1.48 ms)   1.46 ms        █▅  ██        
                             (  6.52 kb …   2.25 mb)  16.67 kb ▂▂▂▁▂▁▄██▅▃██▆▃▂▂▁▂▂▂

ES512 - fast-jwt (sync)                 1.08 ms/iter   1.10 ms             █        
                                 (1.03 ms … 1.19 ms)   1.15 ms  ▂▅▂█▃▆█▆█▄▇█▂       
                             (  2.13 kb … 964.52 kb)   5.15 kb ▆█████████████▅▃▅▃▃▂▃

ES512 - fast-jwt (async)                1.32 ms/iter   1.34 ms     ▆▇▅█ ▃▃          
                                 (1.27 ms … 1.46 ms)   1.41 ms   ▃ ███████▆         
                             (  5.08 kb …   1.66 mb)  11.63 kb ▄▅██████████▄▂▆█▆▃▁▁▁

ES512 - @node-rs/jsonwebtoken (sync)    2.39 µs/iter   2.39 µs  ▂█                  
                                 (2.37 µs … 2.50 µs)   2.50 µs ▃███                 
                             (  1.27 kb …   1.27 kb)   1.27 kb ████▆▇▅▁▁▂▁▂▁▁▂▁▁▁▁▁▂

ES512 - @node-rs/jsonwebtoken (async)   9.32 µs/iter   9.28 µs ▂ █                  
                                (9.09 µs … 10.31 µs)   9.85 µs █ █▅                 
                             (  1.71 kb …   1.84 kb)   1.74 kb █▇██▁▇▇▁▁▁▇▁▁▁▁▁▁▁▁▁▇

summary
  ES512 - @node-rs/jsonwebtoken (sync)
   3.9x faster than ES512 - @node-rs/jsonwebtoken (async)
   451.18x faster than ES512 - fast-jwt (sync)
   454.82x faster than ES512 - jose (sync)
   554.33x faster than ES512 - fast-jwt (async)
   574.96x faster than ES512 - jsonwebtoken (sync)
   576.72x faster than ES512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.80 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (sync)                     2.54 ms/iter   2.53 ms █                    
                                 (2.51 ms … 3.14 ms)   3.11 ms █▂                   
                             (  4.80 kb …  14.85 kb)   4.93 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

RS512 - jsonwebtoken (sync)             3.40 ms/iter   3.40 ms  █▆▂                 
                                 (3.36 ms … 3.59 ms)   3.54 ms  ███▄                
                             (  8.89 kb …  57.29 kb)   9.37 kb ▆████▆▃▂▂▂▁▁▁▁▁▁▁▁▁▁▂

RS512 - jsonwebtoken (async)            3.39 ms/iter   3.40 ms    ▆▆█               
                                 (3.37 ms … 3.54 ms)   3.46 ms   ▅███▇ ▂            
                             (  9.28 kb …  57.28 kb)   9.53 kb ▄████████▆▅▄▃▁▂▁▂▁▁▁▂

RS512 - fast-jwt (sync)                 2.54 ms/iter   2.53 ms █                    
                                 (2.51 ms … 3.15 ms)   3.12 ms █▂                   
                             (  4.41 kb …   7.91 kb)   4.45 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)                3.52 ms/iter   3.55 ms               ▅█     
                                 (3.37 ms … 3.68 ms)   3.60 ms              ▅██▅    
                             (  9.85 kb … 291.22 kb)  11.55 kb ▁▄▂▄▂▁▁▂▁▂▁▂▇████▆▁▁▂

RS512 - @node-rs/jsonwebtoken (sync)    2.54 ms/iter   2.54 ms     █                
                                 (2.49 ms … 2.68 ms)   2.68 ms     █▆               
                             (  2.01 kb …   2.28 kb)   2.03 kb ▁▃▃▃██▆▃▂▂▁▁▁▁▁▁▂▁▁▂▁

RS512 - @node-rs/jsonwebtoken (async)   2.48 ms/iter   2.54 ms  █                   
                                 (2.44 ms … 2.59 ms)   2.58 ms  █                   
                             (  2.63 kb …   2.95 kb)   2.63 kb ███▇▄▂▂▁▂▁▂▂▂▂▂▆▇▄▃▃▂

summary
  RS512 - @node-rs/jsonwebtoken (async)
   1.02x faster than RS512 - fast-jwt (sync)
   1.02x faster than RS512 - jose (sync)
   1.02x faster than RS512 - @node-rs/jsonwebtoken (sync)
   1.37x faster than RS512 - jsonwebtoken (async)
   1.37x faster than RS512 - jsonwebtoken (sync)
   1.42x faster than RS512 - fast-jwt (async)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (sync)                     2.62 ms/iter   2.68 ms █                    
                                 (2.52 ms … 3.33 ms)   3.14 ms █                    
                             (  4.91 kb …   6.01 kb)   4.95 kb ██▂▁▇█▅▄▂▁▁▃▁▂▁▁▁▁▁▁▂

PS512 - jsonwebtoken (sync)             3.38 ms/iter   3.39 ms       ▅█             
                                 (3.35 ms … 3.54 ms)   3.43 ms   ▂█▇███▅▂           
                             (  7.88 kb …  56.47 kb)   9.16 kb ▅▇█████████▇▂▆▃▃▂▁▁▁▃

PS512 - jsonwebtoken (async)            3.53 ms/iter   3.55 ms                 █▅   
                                 (3.38 ms … 3.61 ms)   3.58 ms               ▂▆██   
                             (  8.13 kb …  20.29 kb)   9.14 kb ▂▃▂▂▂▁▁▂▁▁▂▂▃▄█████▄▂

PS512 - fast-jwt (sync)                 2.56 ms/iter   2.54 ms █                    
                                 (2.52 ms … 3.13 ms)   3.11 ms █▂                   
                             (  3.75 kb …  38.49 kb)   4.56 kb ██▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

PS512 - fast-jwt (async)                3.37 ms/iter   3.38 ms    ▅█▂               
                                 (3.35 ms … 3.50 ms)   3.46 ms  ▄▇███▂              
                             (  9.13 kb …   1.16 mb)  15.69 kb ▃██████▇▅▃▃▄▁▁▁▃▂▁▁▁▂

PS512 - @node-rs/jsonwebtoken (sync)    2.44 ms/iter   2.44 ms  █                   
                                 (2.43 ms … 2.72 ms)   2.59 ms  █▃                  
                             (  2.02 kb …   2.28 kb)   2.03 kb ███▅▄▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - @node-rs/jsonwebtoken (async)   2.59 ms/iter   2.61 ms       █▄             
                                 (2.45 ms … 2.84 ms)   2.79 ms       ██▅ ▅          
                             (  2.63 kb …   2.95 kb)   2.64 kb ▃▄▂▂▂▁█████▅▂▁▁▁▁▂▂▂▁

summary
  PS512 - @node-rs/jsonwebtoken (sync)
   1.05x faster than PS512 - fast-jwt (sync)
   1.06x faster than PS512 - @node-rs/jsonwebtoken (async)
   1.07x faster than PS512 - jose (sync)
   1.38x faster than PS512 - fast-jwt (async)
   1.38x faster than PS512 - jsonwebtoken (sync)
   1.44x faster than PS512 - jsonwebtoken (async)
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
EdDSA - jose (sync)                    25.57 µs/iter  25.59 µs              █       
                               (24.87 µs … 27.14 µs)  25.78 µs              ██ █    
                             (  3.18 kb …   3.18 kb)   3.18 kb █▁▁▁▁█▁▁▁▁▁▁███▁█▁▁▁█

EdDSA - fast-jwt (sync)                25.15 µs/iter  25.42 µs █           █        
                               (24.43 µs … 25.91 µs)  25.87 µs █           █       █
                             (  1.89 kb …   1.89 kb)   1.89 kb █▁▁█▁▁▁█▁▁▁▁█▁█▁▁▁▁▁█

EdDSA - fast-jwt (async)              265.45 µs/iter 273.42 µs    ▅█▆               
                             (251.46 µs … 335.13 µs) 289.17 µs    ███▆       ▂      
                             (  3.93 kb … 900.73 kb)   7.22 kb ▁▃█████▇▆▃▄▄▅██▇▅▂▂▂▁

EdDSA - @node-rs/jsonwebtoken (sync)    2.46 µs/iter   2.46 µs   █  ▃█              
                                 (2.44 µs … 2.51 µs)   2.51 µs  ██▆████▆            
                             (  1.27 kb …   1.27 kb)   1.27 kb █████████▄█▄▁▄▁▁▁▆▁▁▄

EdDSA - @node-rs/jsonwebtoken (async)   9.03 µs/iter   9.07 µs     █   █ █          
                                 (8.80 µs … 9.41 µs)   9.35 µs ▅ ▅▅█▅▅ █▅█     ▅   ▅
                             (  1.71 kb …   1.84 kb)   1.74 kb █▁█████▁███▁▁▁▁▁█▁▁▁█

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   3.68x faster than EdDSA - @node-rs/jsonwebtoken (async)
   10.24x faster than EdDSA - fast-jwt (sync)
   10.41x faster than EdDSA - jose (sync)
   108.07x faster than EdDSA - fast-jwt (async)
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
RS512 - fast-jwt                954.83 ns/iter 915.65 ns █                    
                         (875.42 ns … 3.81 µs)   2.16 µs █▅                   
                       (181.47  b … 458.22  b) 456.27  b ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (complete)     906.17 ns/iter 912.27 ns    █ ▃               
                       (887.33 ns … 967.28 ns) 942.81 ns   ▅███▃              
                       (366.35  b … 578.23  b) 576.75  b ▃▆█████▇███▆▆▃▃▁▂▃▃▃▃

RS512 - jsonwebtoken              1.60 µs/iter   1.62 µs               ▂█▃    
                           (1.50 µs … 1.64 µs)   1.64 µs               ███ ▃  
                       (857.28  b … 867.15  b) 866.94  b ▂▁█▆▆▄▁▃▂▃▁▁▁▄█████▆▇

RS512 - jsonwebtoken (complete)   1.54 µs/iter   1.54 µs    █ ▂               
                           (1.50 µs … 1.62 µs)   1.61 µs    █▅██              
                       (858.64  b … 891.16  b) 874.72  b ▅▄▅████▇▇▇▃▂▂▂▁▁▁▁▂▁▂

RS512 - jose                    729.27 ns/iter 739.02 ns    ▅█                
                       (697.98 ns … 802.89 ns) 794.22 ns   ▄██▄  ▃            
                       (426.12  b … 440.21  b) 435.68  b ▂██████▇█▆▄▄▇▃▆▅▃▂▂▂▂

RS512 - jose (complete)         755.40 ns/iter 761.68 ns             ▆█       
                       (692.05 ns … 803.89 ns) 792.38 ns           ▅▅██▂      
                       (414.52  b … 446.12  b) 439.48  b ▂▁▁▁▁▁▁▁▁▄██████▅▂▅▃▂

summary
  RS512 - jose
   1.04x faster than RS512 - jose (complete)
   1.24x faster than RS512 - fast-jwt (complete)
   1.31x faster than RS512 - fast-jwt
   2.11x faster than RS512 - jsonwebtoken (complete)
   2.19x faster than RS512 - jsonwebtoken
```
</details>


Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)               3.03 µs/iter   3.85 µs █                    
                               (2.59 µs … 4.02 µs)   4.02 µs █                 ▃  
                           (  1.26 kb …   1.26 kb)   1.26 kb █▇▃▁▁▁▁▁▁▂▂▁▁▁▁▁▁▂█▃▂

HS512 - fast-jwt (async)              5.39 µs/iter   5.36 µs   █                  
                               (5.08 µs … 6.45 µs)   6.30 µs  ▆█▃▃▃               
                           (823.31  b …   1.64 kb)   1.45 kb ██████▁▄▁▄▁▁▁▁▁▄▁▄▁▁▄

HS512 - fast-jwt (sync with cache)    1.13 µs/iter 953.03 ns █                    
                             (887.26 ns … 1.97 µs)   1.95 µs █                    
                           (723.44  b …   1.16 kb) 890.60  b █▇▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▆▃

HS512 - fast-jwt (async with cache)   1.24 µs/iter   1.47 µs █              ▂     
                               (1.01 µs … 1.73 µs)   1.62 µs █▃             █     
                           (  1.56 kb …   2.07 kb)   1.66 kb ██▇▃▁▃▂▁▁▁▁▂▁▁▂█▆▃▄▃▃

HS512 - jose (sync)                   3.34 µs/iter   3.04 µs   █                  
                               (2.79 µs … 2.89 ms)   4.46 µs  ▂█▄                 
                           (600.00  b … 621.12 kb)   2.32 kb ▁███▆▃▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)         233.62 µs/iter 238.08 µs            ▅█▇       
                           (214.42 µs … 467.25 µs) 250.33 µs            ███▆      
                           (  5.53 kb … 438.59 kb)   6.89 kb ▂▃▅▇█▇▆▃▄▅▅█████▅▃▂▂▁

HS512 - jsonwebtoken (async)        220.80 µs/iter 223.33 µs   ▃█                 
                           (210.38 µs … 353.29 µs) 256.63 µs  ███▂█▇              
                           (  5.80 kb … 947.22 kb)   6.58 kb ▃██████▅▃▂▂▂▃▂▂▂▂▁▁▁▁

summary
  HS512 - fast-jwt (sync with cache)
   1.1x faster than HS512 - fast-jwt (async with cache)
   2.69x faster than HS512 - fast-jwt (sync)
   2.96x faster than HS512 - jose (sync)
   4.78x faster than HS512 - fast-jwt (async)
   195.52x faster than HS512 - jsonwebtoken (async)
   206.87x faster than HS512 - jsonwebtoken (sync)
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
ES512 - fast-jwt (sync)             840.34 µs/iter 842.92 µs             █        
                           (782.50 µs … 911.83 µs) 874.63 µs             █▄       
                           (  2.09 kb … 555.84 kb)   3.63 kb ▁▁▁▁▁▁▁▁▁▁▁▄██▆▃▂▂▁▁▁

ES512 - fast-jwt (async)            914.88 µs/iter 919.63 µs              █▃      
                           (858.54 µs … 978.96 µs) 944.63 µs              ██      
                           (  4.27 kb … 836.84 kb)   7.44 kb ▁▁▁▁▁▃▃▂▂▁▁▁▃███▄▂▂▁▁

ES512 - fast-jwt (sync with cache)    1.24 µs/iter   1.04 µs    █▇                
                             (916.00 ns … 2.85 ms)   1.58 µs    ██                
                           (912.00  b …  97.09 kb) 976.75  b ▁▃▁██▇▂▁▁▂▁▁▁▁▁▂▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.27 µs/iter   1.17 µs     █                
                               (1.00 µs … 1.37 ms)   1.62 µs    ▂█▅               
                           (  1.66 kb … 129.66 kb)   1.99 kb ▁▁▁███▁▄▂▂▁▁▁▁▁▁▁▁▁▁▁

ES512 - jose (sync)                 843.36 µs/iter 845.21 µs           █          
                           (786.50 µs … 935.50 µs) 893.42 µs           █          
                           (  2.40 kb … 851.24 kb)   3.66 kb ▁▁▁▁▁▁▁▁▁▂██▄▃▂▂▁▁▁▁▁

ES512 - jsonwebtoken (sync)         934.94 µs/iter 938.50 µs           █          
                             (870.75 µs … 1.12 ms) 994.54 µs           █▇         
                           (  4.48 kb … 707.00 kb)   5.93 kb ▁▁▁▂▁▂▂▁▁▂██▆▂▁▁▁▁▁▁▁

ES512 - jsonwebtoken (async)        936.22 µs/iter 937.96 µs   ▃█                 
                             (926.92 µs … 1.01 ms) 966.63 µs  ▃███▅               
                           (  4.67 kb …   1.58 mb)  10.68 kb ▂██████▆▄▄▃▁▂▂▁▁▁▂▁▁▁

summary
  ES512 - fast-jwt (sync with cache)
   1.02x faster than ES512 - fast-jwt (async with cache)
   679.86x faster than ES512 - fast-jwt (sync)
   682.3x faster than ES512 - jose (sync)
   740.16x faster than ES512 - fast-jwt (async)
   756.4x faster than ES512 - jsonwebtoken (sync)
   757.43x faster than ES512 - jsonwebtoken (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)              45.16 µs/iter  45.24 µs █                  █ 
                             (44.80 µs … 46.25 µs)  45.28 µs █▅ ▅      ▅  ▅  ▅ ▅█▅
                           (  1.80 kb …   1.81 kb)   1.80 kb ██▁█▁▁▁▁▁▁█▁▁█▁▁█▁███

RS512 - fast-jwt (async)            128.43 µs/iter 132.04 µs          █           
                           (119.79 µs … 191.54 µs) 144.88 µs  █▆      ██          
                           (  4.42 kb … 613.58 kb)   5.86 kb ▃███▅▄▂▂▄██▇▅▃▂▂▂▁▁▁▁

RS512 - fast-jwt (sync with cache)    1.51 µs/iter   1.32 µs █                    
                               (1.26 µs … 2.37 µs)   2.34 µs █                    
                           (888.29  b … 898.12  b) 897.84  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▆▄

RS512 - fast-jwt (async with cache)   1.70 µs/iter   2.01 µs  █                ▃  
                               (1.43 µs … 2.10 µs)   2.08 µs ▄█                █  
                           (  1.56 kb …   1.67 kb)   1.65 kb ██▅▃▂▁▁▁▁▁▁▁▁▁▁▁▁▇█▄▂

RS512 - jose (sync)                  42.96 µs/iter  42.83 µs  █                   
                              (41.75 µs … 1.23 ms)  51.63 µs  █                   
                           (  2.29 kb … 304.27 kb)   3.17 kb ▆██▄▂▁▂▃▂▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)         128.81 µs/iter 131.63 µs           █          
                             (120.63 µs … 1.19 ms) 142.13 µs   ▇▆     ██▃         
                           (  7.33 kb … 869.80 kb)   9.95 kb ▂███▆▄▃▂▃███▅▄▂▂▂▂▂▁▁

RS512 - jsonwebtoken (async)        125.93 µs/iter 126.29 µs   █                  
                             (120.50 µs … 2.21 ms) 142.96 µs  ██                  
                           (  1.14 kb … 165.64 kb)   8.58 kb ▂███▃▃▂▁▁▃▆▃▂▂▂▂▂▁▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   1.12x faster than RS512 - fast-jwt (async with cache)
   28.45x faster than RS512 - jose (sync)
   29.91x faster than RS512 - fast-jwt (sync)
   83.41x faster than RS512 - jsonwebtoken (async)
   85.06x faster than RS512 - fast-jwt (async)
   85.31x faster than RS512 - jsonwebtoken (sync)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.76 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)              45.97 µs/iter  46.59 µs                  █   
                             (44.13 µs … 46.98 µs)  46.94 µs                  █   
                           (  1.76 kb …   1.77 kb)   1.77 kb █▁█▁▁▁▁█▁▁██▁▁▁▁▁████

PS512 - fast-jwt (async)             73.33 µs/iter  75.13 µs  █                   
                              (69.42 µs … 1.71 ms)  93.04 µs  █   ▂               
                           (  4.36 kb … 397.64 kb)   5.39 kb ▇██▄▃█▅▂▂▂▁▁▂▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)    1.48 µs/iter   1.28 µs  █                   
                               (1.22 µs … 2.36 µs)   2.34 µs ▅█                   
                           (879.95  b … 889.60  b) 889.41  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▅▄

PS512 - fast-jwt (async with cache)   1.64 µs/iter   1.94 µs  █                   
                               (1.37 µs … 2.12 µs)   2.08 µs ▅█              ▅    
                           (  1.56 kb …   1.66 kb)   1.65 kb ██▅▂▂▂▂▁▁▁▁▁▁▁▂▇█▅▅▂▂

PS512 - jose (sync)                  47.65 µs/iter  47.67 µs       █              
                              (44.00 µs … 1.16 ms)  54.17 µs       █▆             
                           (360.00  b … 355.05 kb)   3.35 kb ▁▁▁▁▁▇██▆▂▁▂▂▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)          74.37 µs/iter  75.54 µs  ▅▃     █▃           
                              (69.21 µs … 3.01 ms)  83.58 µs  ██     ██           
                           (  1.30 kb … 546.25 kb)   9.40 kb ▂██▆▂▂▂▆███▄▃▃▂▁▁▁▁▁▁

PS512 - jsonwebtoken (async)         71.80 µs/iter  70.88 µs  ▂█                  
                              (69.25 µs … 2.87 ms)  80.46 µs  ██▅                 
                           (  8.40 kb … 393.91 kb)   8.87 kb ▂███▄▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   1.11x faster than PS512 - fast-jwt (async with cache)
   31.09x faster than PS512 - fast-jwt (sync)
   32.22x faster than PS512 - jose (sync)
   48.56x faster than PS512 - jsonwebtoken (async)
   49.6x faster than PS512 - fast-jwt (async)
   50.3x faster than PS512 - jsonwebtoken (sync)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.80 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)              66.87 µs/iter  66.58 µs  █                   
                            (65.83 µs … 101.29 µs)  78.25 µs ▇█                   
                           (  1.72 kb … 367.73 kb)   2.29 kb ██▄▂▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)            109.31 µs/iter 109.50 µs  █▆                  
                           (106.54 µs … 204.38 µs) 123.17 µs  ██                  
                           (  3.62 kb … 452.90 kb)   4.30 kb ▃███▅▅▃▂▂▁▃▃▂▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)    1.23 µs/iter   1.78 µs ▃ █                  
                             (944.07 ns … 1.95 µs)   1.94 µs █ █                  
                           (  1.04 kb …   1.04 kb)   1.04 kb █▆█▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▂▇▂

EdDSA - fast-jwt (async with cache)   1.32 µs/iter   1.55 µs  █                   
                               (1.06 µs … 1.74 µs)   1.72 µs ▆█            ▂█     
                           (  1.73 kb …   1.84 kb)   1.83 kb ██▄▅▂▁▁▁▁▁▁▁▁▁██▆▄▄▂▂

EdDSA - jose (sync)                  67.21 µs/iter  67.04 µs  █                   
                            (66.17 µs … 112.92 µs)  78.42 µs  █                   
                           (  2.20 kb … 469.91 kb)   3.05 kb ██▆▂▁▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.08x faster than EdDSA - fast-jwt (async with cache)
   54.58x faster than EdDSA - fast-jwt (sync)
   54.87x faster than EdDSA - jose (sync)
   89.23x faster than EdDSA - fast-jwt (async)
```
</details>

