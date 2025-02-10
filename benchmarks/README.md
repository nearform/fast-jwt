# Benchmarks

## Signing

<details>
        <summary>HS512</summary>
        ```
            clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (sync)                     3.29 µs/iter   2.75 µs  █                   
                                 (2.50 µs … 2.71 ms)   6.50 µs  █                   
                             (376.00  b …   1.12 mb)   2.98 kb ▃█▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)           221.11 µs/iter 228.13 µs     ▃     █          
                             (203.88 µs … 475.33 µs) 251.58 µs   ███▇▅ ▅▅██         
                             (  6.11 kb … 905.44 kb)   9.51 kb ▃▆█████▇█████▅▃▂▂▂▂▁▁

HS512 - jsonwebtoken (async)          213.75 µs/iter 215.08 µs   ▅█▂                
                               (205.63 µs … 1.03 ms) 246.71 µs  ▄███▄               
                             (  2.31 kb … 765.81 kb)  14.88 kb ███████▄▃▂▂▂▂▁▁▁▁▁▁▁▁

HS512 - fast-jwt (sync)                 2.42 µs/iter   2.58 µs    █▂                
                                 (2.23 µs … 2.75 µs)   2.67 µs    ██           █    
                             (  1.60 kb …   1.60 kb)   1.60 kb ▂▂▃██▂▂▁▁▂▁▁▃▁▃▇█▅▂▁▂

HS512 - fast-jwt (async)                4.32 µs/iter   4.40 µs                █     
                                 (4.11 µs … 4.83 µs)   4.49 µs   █▅         ▅ █ ▅   
                             (444.30  b … 589.29  b) 515.42  b ▅████▅▁▅▅▁▅▅▅███▁█▁█▅

HS512 - @node-rs/jsonwebtoken (sync)    2.78 µs/iter   2.79 µs      ▃█              
                                (2.58 µs … 71.46 µs)   3.13 µs      ██ ▄            
                             (  1.34 kb … 129.41 kb)   1.38 kb ▁▁▁▅▁██▁█▅▁▃▄▁▄▂▁▁▁▁▁

HS512 - @node-rs/jsonwebtoken (async)  10.70 µs/iter  10.96 µs       █              
                               (8.71 µs … 149.42 µs)  15.00 µs   ▆▃ ▃█              
                             (  3.02 kb … 131.04 kb)   3.29 kb ▁▄█████▆▃▃▇▃▃▅▄▂▁▁▁▁▁

summary
  HS512 - fast-jwt (sync)
   1.15x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.36x faster than HS512 - jose (sync)
   1.78x faster than HS512 - fast-jwt (async)
   4.42x faster than HS512 - @node-rs/jsonwebtoken (async)
   88.27x faster than HS512 - jsonwebtoken (async)
   91.31x faster than HS512 - jsonwebtoken (sync)
        ```
    </details>
    
<details>
        <summary>ES512</summary>
        ```
            clk: ~3.78 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
ES512 - jose (sync)                     1.10 ms/iter   1.10 ms        █             
                                 (1.03 ms … 1.20 ms)   1.18 ms       ▂█             
                             (  3.27 kb …   1.20 mb)   7.68 kb ▁▁▁▁▁▁███▄▃▄▃▃▂▂▂▂▂▁▁

ES512 - jsonwebtoken (sync)             1.38 ms/iter   1.38 ms         █▅           
                                 (1.30 ms … 1.63 ms)   1.46 ms         ██           
                             (  6.46 kb …  55.28 kb)   7.83 kb ▁▁▁▁▂▂▂▅███▄▃▂▂▂▁▁▁▁▁

ES512 - jsonwebtoken (async)            1.38 ms/iter   1.38 ms            ██        
                                 (1.32 ms … 1.46 ms)   1.42 ms           ▅██▅       
                             ( 10.27 kb …   1.36 mb)  21.98 kb ▁▁▁▁▂▂▁▂▁▄█████▆▁▂▃▂▁

ES512 - fast-jwt (sync)                 1.09 ms/iter   1.09 ms   █                  
                                 (1.08 ms … 1.24 ms)   1.13 ms  ▆██                 
                             (  2.26 kb … 964.34 kb)   5.80 kb ▂███▆▆▅▃▂▂▁▂▂▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async)                1.38 ms/iter   1.40 ms       █              
                                 (1.27 ms … 1.69 ms)   1.55 ms      ▆█              
                             (  5.48 kb …   1.37 mb)  11.55 kb ▂▁▁▃▃████▆▄▄▅▃▃▂▁▁▁▂▁

ES512 - @node-rs/jsonwebtoken (sync)    2.60 µs/iter   2.64 µs   ▅ █▅               
                                 (2.49 µs … 2.78 µs)   2.75 µs   █▇██▂▇ ▅ ▅         
                             (  1.27 kb …   1.27 kb)   1.27 kb ▄▁██████▇█▇█▇▇▇▄▄▄▄▄▇

ES512 - @node-rs/jsonwebtoken (async)  12.08 µs/iter  12.83 µs         █  ▄         
                               (8.25 µs … 163.33 µs)  16.58 µs         █▆ █         
                             (  2.98 kb … 163.00 kb)   3.25 kb ▁▂▂▃▆██▇████▇▇▅▂▂▂▁▁▁

summary
  ES512 - @node-rs/jsonwebtoken (sync)
   4.65x faster than ES512 - @node-rs/jsonwebtoken (async)
   418.78x faster than ES512 - fast-jwt (sync)
   422.64x faster than ES512 - jose (sync)
   530.58x faster than ES512 - jsonwebtoken (sync)
   531.48x faster than ES512 - fast-jwt (async)
   531.78x faster than ES512 - jsonwebtoken (async)
        ```
    </details>
    
<details>
        <summary>RS512</summary>
        ```
            clk: ~3.75 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (sync)                     2.74 ms/iter   2.76 ms    █                 
                                 (2.61 ms … 3.37 ms)   3.32 ms  ▄ █▄                
                             (  4.80 kb …  13.74 kb)   4.94 kb ▂█▇██▅▄▂▁▁▁▁▁▁▁▁▁▁▁▂▁

RS512 - jsonwebtoken (sync)             3.70 ms/iter   3.72 ms   █                  
                                 (3.48 ms … 5.32 ms)   5.00 ms  ▇█                  
                             (  8.89 kb …   9.81 kb)   9.20 kb ▆██▇▇▄▂▁▁▁▂▁▁▁▂▁▁▁▁▁▁

RS512 - jsonwebtoken (async)            3.63 ms/iter   3.64 ms                █     
                                 (3.48 ms … 3.76 ms)   3.68 ms               ▆█▅    
                             ( 13.41 kb …  61.78 kb)  14.22 kb ▁▁▁▂▂▁▁▁▁▁▁▁▁████▅▃▁▂

RS512 - fast-jwt (sync)                 2.70 ms/iter   2.71 ms     █                
                                 (2.57 ms … 3.31 ms)   3.29 ms    ▄█                
                             (  4.41 kb …   7.91 kb)   4.47 kb ▂▃▄██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)                3.57 ms/iter   3.61 ms  █                   
                                 (3.49 ms … 3.92 ms)   3.87 ms  ███   ▆             
                             ( 10.55 kb …  15.80 kb)  10.64 kb ▇███▇▂▃█▅▃▁▁▂▁▂▁▂▁▁▁▁

RS512 - @node-rs/jsonwebtoken (sync)    2.65 ms/iter   2.66 ms         █ ▇          
                                 (2.46 ms … 2.90 ms)   2.84 ms         █ █▅         
                             (  2.02 kb …   2.28 kb)   2.03 kb ▁▁▁▂▁▃▃▇█▆██▅▅▆▂▂▁▁▂▂

RS512 - @node-rs/jsonwebtoken (async)   2.63 ms/iter   2.67 ms        ██            
                                 (2.44 ms … 3.03 ms)   2.93 ms        ██▇▇          
                             (  3.66 kb …   3.71 kb)   3.66 kb ▆▇▆▅█▆▃████▁▂▁▃▂▃▂▁▂▂

summary
  RS512 - @node-rs/jsonwebtoken (async)
   1.01x faster than RS512 - @node-rs/jsonwebtoken (sync)
   1.03x faster than RS512 - fast-jwt (sync)
   1.04x faster than RS512 - jose (sync)
   1.36x faster than RS512 - fast-jwt (async)
   1.38x faster than RS512 - jsonwebtoken (async)
   1.41x faster than RS512 - jsonwebtoken (sync)
        ```
    </details>
    
<details>
        <summary>PS512</summary>
        ```
            clk: ~3.68 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - jose (sync)                     2.79 ms/iter   2.80 ms  ▇█                  
                                 (2.71 ms … 3.50 ms)   3.43 ms  ██▂                 
                             (  4.91 kb …   5.84 kb)   4.95 kb ▂███▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂

PS512 - jsonwebtoken (sync)             3.65 ms/iter   3.69 ms      █▂              
                                 (3.53 ms … 4.11 ms)   3.87 ms     ▅██  ▆           
                             (  7.74 kb …  10.75 kb)   8.97 kb ▃▂▃▇████▂█▇▆▄▄▂▂▂▁▂▂▂

PS512 - jsonwebtoken (async)            3.57 ms/iter   3.57 ms     █▂               
                                 (3.48 ms … 3.86 ms)   3.79 ms     ██               
                             ( 12.35 kb …  62.06 kb)  14.57 kb ▁▁▂▇██▇▂▂▄▃▂▁▁▁▂▁▁▁▁▁

PS512 - fast-jwt (sync)                 2.73 ms/iter   2.71 ms   █                  
                                 (2.63 ms … 3.40 ms)   3.35 ms   █                  
                             (  3.88 kb …  42.59 kb)   4.63 kb ▂▂█▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (async)                3.58 ms/iter   3.62 ms         ▂     █▂     
                                 (3.44 ms … 3.73 ms)   3.68 ms        ▃█    ▃██▂    
                             (  9.73 kb …   1.23 mb)  16.88 kb ▂▁▁▂▂▃▆██▇▃▂▂████▆▁▂▂

PS512 - @node-rs/jsonwebtoken (sync)    2.60 ms/iter   2.62 ms                 ██   
                                 (2.45 ms … 2.67 ms)   2.65 ms                 ██   
                             (  2.02 kb …   2.28 kb)   2.02 kb ▁▂▁▁▁▁▂▁▁▆▄▂▂▂▁▂██▇▄▁

PS512 - @node-rs/jsonwebtoken (async)   2.57 ms/iter   2.63 ms                  ▃█  
                                 (2.45 ms … 2.68 ms)   2.66 ms                  ██  
                             (  3.66 kb …   3.71 kb)   3.66 kb ▇▇▅█▇▃▃▇▂▄▄▄▂▁▁▂▁██▆▄

summary
  PS512 - @node-rs/jsonwebtoken (async)
   1.01x faster than PS512 - @node-rs/jsonwebtoken (sync)
   1.06x faster than PS512 - fast-jwt (sync)
   1.09x faster than PS512 - jose (sync)
   1.39x faster than PS512 - jsonwebtoken (async)
   1.4x faster than PS512 - fast-jwt (async)
   1.42x faster than PS512 - jsonwebtoken (sync)
        ```
    </details>
    
<details>
        <summary>EdDSA</summary>
        ```
            clk: ~3.77 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (sync)                    25.42 µs/iter  25.38 µs             █        
                               (24.79 µs … 26.86 µs)  25.75 µs ▅         ▅ █        
                             (  3.14 kb …   3.14 kb)   3.14 kb █▁▁▁▁▁▁▁▁▁█▇█▁▁▇▁▁▁▁▇

EdDSA - fast-jwt (sync)                25.92 µs/iter  26.61 µs █                    
                               (24.42 µs … 27.46 µs)  26.88 µs █      ▅▅  ▅▅▅ ▅  ▅▅▅
                             (  1.89 kb …   1.89 kb)   1.89 kb █▁▁▁▁▁▁██▁▁███▁█▁▁███

EdDSA - fast-jwt (async)              265.43 µs/iter 275.58 µs   █▂▅                
                             (247.46 µs … 397.46 µs) 305.67 µs ▃ ████▂ ▂ ▆▅▃        
                             (  4.97 kb … 981.54 kb)   7.59 kb █████████████▄▂▂▂▂▂▁▁

EdDSA - @node-rs/jsonwebtoken (sync)    2.38 µs/iter   2.38 µs    ▆█                
                                 (2.34 µs … 2.49 µs)   2.49 µs   ▇██▇               
                             (  1.27 kb …   1.27 kb)   1.27 kb ▇█████▃▄▁▄▁▃▁▃▁▁▆▁▁▁▃

EdDSA - @node-rs/jsonwebtoken (async)  12.48 µs/iter  13.50 µs                █     
                               (8.79 µs … 118.50 µs)  15.17 µs         ▄▆  ▂ ▃█▂    
                             (  2.98 kb … 163.00 kb)   3.25 kb ▁▁▁▄▆▃▆▅██▇▄█████▃▂▁▁

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   5.25x faster than EdDSA - @node-rs/jsonwebtoken (async)
   10.69x faster than EdDSA - jose (sync)
   10.9x faster than EdDSA - fast-jwt (sync)
   111.62x faster than EdDSA - fast-jwt (async)
        ```
    </details>
    

## Decoding

<details>
        <summary>RS512</summary>
        ```
            clk: ~3.71 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                961.66 ns/iter 966.57 ns     █▄               
                         (926.89 ns … 1.04 µs)   1.03 µs     ██▅              
                       (189.83  b … 458.22  b) 456.35  b ▂▂▃████▅▅▄▅▃▂▂▄▂▃▂▂▂▂

RS512 - fast-jwt (complete)     956.23 ns/iter 963.56 ns       ▃█   ▂         
                         (925.47 ns … 1.00 µs) 992.61 ns      ▅████▇█▇        
                       (369.89  b … 578.23  b) 576.72  b ▂▁▁▁▆█████████▄▄▂▃▂▂▂

RS512 - jsonwebtoken              1.63 µs/iter   1.63 µs   ▃  ▃█   ▆          
                           (1.61 µs … 1.67 µs)   1.65 µs   ██▂██▂▇██▅▇▂  ▇    
                       (857.28  b … 867.14  b) 866.94  b ▆▆█████████████▆██▃▃▆

RS512 - jsonwebtoken (complete)   1.63 µs/iter   1.64 µs          █ █▆        
                           (1.61 µs … 1.66 µs)   1.65 µs     ▃▆█  █████  ▃▃   
                       (858.70  b … 891.18  b) 873.93  b ▃▇▇█████▅█████▇▅██▅▃▃

RS512 - jose                    739.80 ns/iter 743.11 ns          ██          
                       (703.56 ns … 783.20 ns) 771.10 ns         ▄███         
                       (268.81  b … 426.24  b) 425.35  b ▂▁▁▁▁▁▄██████▆█▃▃▂▄▄▃

RS512 - jose (complete)         747.62 ns/iter 753.03 ns     █                
                       (729.11 ns … 799.61 ns) 785.38 ns  ▃ ▅██▆█▇▂           
                       (414.49  b … 446.12  b) 439.45  b ▃██████████▆▆▃▂▁▅▂▂▁▂

summary
  RS512 - jose
   1.01x faster than RS512 - jose (complete)
   1.29x faster than RS512 - fast-jwt (complete)
   1.3x faster than RS512 - fast-jwt
   2.2x faster than RS512 - jsonwebtoken
   2.2x faster than RS512 - jsonwebtoken (complete)
        ```
    </details>
    

Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying

<details>
        <summary>HS512</summary>
        ```
            clk: ~3.73 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)               3.09 µs/iter   3.97 µs  █                   
                               (2.57 µs … 4.12 µs)   4.12 µs ▇█                   
                           (  1.26 kb …   1.26 kb)   1.26 kb ██▁▁▁▁▁▁▁▁▂▁▁▂▁▁▁▁▆▆▆

HS512 - fast-jwt (async)              5.79 µs/iter   5.77 µs   █                  
                               (5.72 µs … 6.58 µs)   5.88 µs  ▆█                  
                           (271.51  b … 442.32  b) 355.74  b ████▄▁█▄▁▄▄▄▄▁▄▁▁▁▁▁▄

HS512 - fast-jwt (sync with cache)    1.18 µs/iter 976.21 ns █▆                   
                             (914.38 ns … 2.31 µs)   2.29 µs ██                   
                           (455.00  b …   1.27 kb) 715.73  b ██▄▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▇▃

HS512 - fast-jwt (async with cache)   1.73 µs/iter   1.92 µs ▇             █      
                               (1.48 µs … 2.12 µs)   2.09 µs █             █      
                           (  2.06 kb …   2.34 kb)   2.09 kb █▅▂▁▃▂▁▁▁▁▁▂▁▁██▂▂▁▁▂

HS512 - jose (sync)                   3.51 µs/iter   3.21 µs     █                
                               (2.79 µs … 3.15 ms)   4.46 µs     █▆               
                           (  1.09 kb … 621.12 kb)   2.32 kb ▁▅█▅██▇▂▂▂▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)         229.01 µs/iter 235.33 µs           ▄█▆        
                           (211.04 µs … 436.21 µs) 251.83 µs    █▆▃  ▃▃████       
                           (  6.15 kb …   1.15 mb)   9.66 kb ▃█████▇▅███████▄▃▂▂▁▂

HS512 - jsonwebtoken (async)        234.61 µs/iter 237.54 µs       █              
                           (224.08 µs … 341.17 µs) 252.88 µs   ▃  ▅█▅▃            
                           (  7.55 kb …   8.61 kb)   7.63 kb ▁▂██▅███████▅▄▃▂▂▂▁▁▁

summary
  HS512 - fast-jwt (sync with cache)
   1.48x faster than HS512 - fast-jwt (async with cache)
   2.63x faster than HS512 - fast-jwt (sync)
   2.98x faster than HS512 - jose (sync)
   4.93x faster than HS512 - fast-jwt (async)
   194.83x faster than HS512 - jsonwebtoken (sync)
   199.6x faster than HS512 - jsonwebtoken (async)
        ```
    </details>
    
<details>
        <summary>ES512</summary>
        ```
            clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)             825.15 µs/iter 825.71 µs        █             
                           (791.17 µs … 932.88 µs) 876.50 µs        █▄            
                           (  2.09 kb … 554.78 kb)   3.59 kb ▁▁▁▁▁▁▆██▄▃▂▂▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async)            901.90 µs/iter 903.96 µs           █          
                           (856.88 µs … 993.38 µs) 939.96 µs          ▄█▅         
                           (  5.07 kb … 773.70 kb)   6.81 kb ▁▁▁▁▁▁▁▁▁████▃▃▂▂▁▁▁▁

ES512 - fast-jwt (sync with cache)    1.26 µs/iter   1.13 µs     █▂               
                             (958.00 ns … 3.40 ms)   1.63 µs     ██               
                           (840.00  b … 169.67 kb) 893.41  b ▁▁▂▄██▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.87 µs/iter   1.67 µs    ▂█                
                               (1.46 µs … 1.72 ms)   2.21 µs    ██ ▆              
                           (  2.27 kb …  98.27 kb)   2.47 kb ▁▁▄██▁█▆▃▂▁▁▁▁▁▁▁▁▁▁▁

ES512 - jose (sync)                 829.93 µs/iter 829.67 µs         █            
                           (779.04 µs … 914.29 µs) 886.83 µs         █▂           
                           (  2.40 kb … 819.02 kb)   3.99 kb ▁▁▁▁▁▁▁▂██▄▂▂▂▂▂▂▂▁▁▁

ES512 - jsonwebtoken (sync)         920.19 µs/iter 921.17 µs   █                  
                             (908.54 µs … 1.10 ms) 975.79 µs  ▅██                 
                           (  4.36 kb …   1.14 mb)  10.62 kb ▂████▅▄▂▂▂▁▁▁▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (async)        921.54 µs/iter 922.63 µs   █▄                 
                             (907.88 µs … 1.03 ms) 970.63 µs   ██                 
                           (  5.55 kb …   0.99 mb)   6.98 kb ▁████▇▅▂▃▂▂▁▁▁▁▃▂▂▁▁▁

summary
  ES512 - fast-jwt (sync with cache)
   1.49x faster than ES512 - fast-jwt (async with cache)
   656.4x faster than ES512 - fast-jwt (sync)
   660.2x faster than ES512 - jose (sync)
   717.45x faster than ES512 - fast-jwt (async)
   732x faster than ES512 - jsonwebtoken (sync)
   733.07x faster than ES512 - jsonwebtoken (async)
        ```
    </details>
    
<details>
        <summary>RS512</summary>
        ```
            clk: ~3.81 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
RS512 - fast-jwt (sync)              44.69 µs/iter  44.63 µs   █                  
                             (44.30 µs … 46.76 µs)  44.93 µs ▅▅█▅▅▅   ▅▅     ▅   ▅
                           (  1.72 kb …   1.72 kb)   1.72 kb ██████▁▁▁██▁▁▁▁▁█▁▁▁█

RS512 - fast-jwt (async)            130.89 µs/iter 132.79 µs         ▃█           
                           (121.75 µs … 212.67 µs) 144.29 µs         ██▇          
                           (  1.42 kb … 533.89 kb)   6.37 kb ▂██▃▃▂▂▇███▇▅▃▂▂▁▂▁▁▁

RS512 - fast-jwt (sync with cache)    1.51 µs/iter   1.32 µs █                    
                               (1.25 µs … 2.62 µs)   2.61 µs █▃                   
                           (712.03  b … 968.96  b) 724.06  b ██▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▄▅

RS512 - fast-jwt (async with cache)   2.15 µs/iter   2.33 µs █              █     
                               (1.89 µs … 2.49 µs)   2.48 µs █              █     
                           (  2.06 kb …   2.10 kb)   2.09 kb ██▆▁▂▂▁▁▁▁▁▁▁▁███▄▂▁▄

RS512 - jose (sync)                  48.21 µs/iter  45.71 µs  █                   
                            (41.75 µs … 835.21 µs) 169.25 µs  █                   
                           ( 48.00  b … 328.73 kb)   3.28 kb ▆█▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)         129.09 µs/iter 130.75 µs          █           
                             (119.67 µs … 1.18 ms) 142.04 µs          ██          
                           (  2.80 kb … 642.80 kb)   9.87 kb ▂█▄▂▂▂▂▂▆██▅▄▂▂▁▁▁▁▁▁

RS512 - jsonwebtoken (async)        133.11 µs/iter 132.67 µs        █             
                             (125.25 µs … 2.09 ms) 143.58 µs        █▄            
                           (  9.52 kb … 140.02 kb)   9.59 kb ▁▁▁▁▁▁███▄▄▂▂▁▁▁▁▁▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   1.42x faster than RS512 - fast-jwt (async with cache)
   29.53x faster than RS512 - fast-jwt (sync)
   31.85x faster than RS512 - jose (sync)
   85.29x faster than RS512 - jsonwebtoken (sync)
   86.48x faster than RS512 - fast-jwt (async)
   87.94x faster than RS512 - jsonwebtoken (async)
        ```
    </details>
    
<details>
        <summary>PS512</summary>
        ```
            clk: ~3.80 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)              47.00 µs/iter  47.14 µs █      █             
                             (46.62 µs … 47.90 µs)  47.30 µs █▅ ▅   █     ▅▅▅ ▅  ▅
                           (  1.68 kb …   1.68 kb)   1.68 kb ██▁█▁▁▁█▁▁▁▁▁███▁█▁▁█

PS512 - fast-jwt (async)             75.62 µs/iter  76.54 µs         █▃           
                              (70.04 µs … 4.64 ms)  84.54 µs  ▅▂     ██           
                           (  1.81 kb … 423.81 kb)   6.10 kb ▃██▅▃▃▂▅██▇▃▃▂▂▂▁▁▁▁▁

PS512 - fast-jwt (sync with cache)    1.44 µs/iter   1.24 µs █▆                   
                               (1.17 µs … 2.57 µs)   2.54 µs ██                   
                           (703.36  b … 969.94  b) 715.57  b ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃▇

PS512 - fast-jwt (async with cache)   2.02 µs/iter   2.19 µs              █       
                               (1.74 µs … 2.43 µs)   2.39 µs ▅▅▅          █ ▂     
                           (  2.06 kb …   2.09 kb)   2.09 kb ███▇▁▁▄▄▂▁▁▁▆███▅▄▁▄▂

PS512 - jose (sync)                  47.34 µs/iter  47.54 µs        █             
                            (43.46 µs … 138.00 µs)  53.67 µs        █▅            
                           (  2.19 kb … 355.05 kb)   3.32 kb ▂▂▁▁▁▁▃██▅▂▁▁▂▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)          76.00 µs/iter  75.96 µs         █            
                              (68.88 µs … 3.09 ms)  84.63 µs         ██           
                           (  1.77 kb … 637.75 kb)   9.45 kb ▁▄▄▂▂▂▁▆██▅▃▂▂▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)         76.97 µs/iter  76.67 µs         ██           
                              (69.79 µs … 2.68 ms)  84.67 µs         ██           
                           (  9.41 kb … 331.65 kb)   9.85 kb ▂▅▃▂▁▁▁▄██▇▃▃▂▂▁▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   1.41x faster than PS512 - fast-jwt (async with cache)
   32.72x faster than PS512 - fast-jwt (sync)
   32.96x faster than PS512 - jose (sync)
   52.65x faster than PS512 - fast-jwt (async)
   52.91x faster than PS512 - jsonwebtoken (sync)
   53.58x faster than PS512 - jsonwebtoken (async)
        ```
    </details>
    
<details>
        <summary>EdDSA</summary>
        ```
            clk: ~3.82 GHz
cpu: Apple M3 Pro
runtime: node 22.13.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)              67.00 µs/iter  66.71 µs ▅█                   
                            (65.83 µs … 138.50 µs)  78.21 µs ██                   
                           (  1.63 kb … 389.68 kb)   2.52 kb ██▅▃▂▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)            109.63 µs/iter 109.71 µs  █▃                  
                           (107.54 µs … 179.38 µs) 122.54 µs  ██                  
                           (  4.43 kb … 581.95 kb)   5.12 kb ▃███▄▄▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)    1.22 µs/iter   1.03 µs  █                   
                             (963.12 ns … 2.05 µs)   2.04 µs ▅█                   
                           (598.38  b …   1.45 kb) 893.05  b ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▅▆

EdDSA - fast-jwt (async with cache)   1.77 µs/iter   1.93 µs ▅                █▃  
                               (1.51 µs … 2.01 µs)   1.98 µs █▂               ██  
                           (  2.26 kb …   2.29 kb)   2.26 kb ██▃▄▁▁▁▁▁▁▁▁▁▁▁▁▁██▂▅

EdDSA - jose (sync)                  67.74 µs/iter  67.04 µs  █                   
                            (66.00 µs … 108.21 µs)  81.58 µs ▅█                   
                           (  2.03 kb … 450.41 kb)   3.01 kb ██▃▂▂▂▁▁▁▁▁▂▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.44x faster than EdDSA - fast-jwt (async with cache)
   54.77x faster than EdDSA - fast-jwt (sync)
   55.38x faster than EdDSA - jose (sync)
   89.63x faster than EdDSA - fast-jwt (async)
        ```
    </details>
    
