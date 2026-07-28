# Benchmarks

Made with [mitata](https://github.com/evanwashere/mitata) library

Note that `@node-rs/jsonwebtoken` does not support ES512, so it is excluded from the ES512 comparisons,
and that `jose` has been promise based since v3, so it only appears in the asynchronous comparisons.

## Signing


<details>
    <summary>HS256</summary>

## HS256
```
clk: ~3.13 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS256 - jose (async)                   19.40 µs/iter  19.96 µs  █▃                  
                              (15.00 µs … 632.08 µs)  45.42 µs  ██▄                 
                             (472.00  b …   1.40 mb)  13.77 kb ▅████▄▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (sync)             3.46 µs/iter   3.33 µs  █                   
                               (2.96 µs … 553.08 µs)   6.25 µs  ██                  
                             ( 16.00  b …   1.21 mb)   4.12 kb ▁██▅▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (async)            5.16 µs/iter   5.74 µs  █                   
                                 (4.48 µs … 6.30 µs)   6.22 µs ██▅           █▅     
                             (  1.79 kb …   7.24 kb)   6.79 kb ███▁▁▅▅▁▁▅▁▅▅▅██▁▁▅▁▅

HS256 - fast-jwt (sync)                 2.33 µs/iter   2.32 µs ▄█▄                  
                                 (2.21 µs … 2.90 µs)   2.86 µs ████                 
                             (  1.19 kb …   1.96 kb)   1.52 kb ████▇▂▅▂▁▁▁▁▁▁▁▁▂▂▄▁▄

HS256 - fast-jwt (async)                4.21 µs/iter   5.14 µs ▅ █                  
                                 (3.62 µs … 5.47 µs)   5.41 µs █▇█▂▂             ▂▂ 
                             (  3.61 kb …   4.22 kb)   3.66 kb █████▁▁▁▁▁▁▁▁▁▁▄▁▄██▇

HS256 - @node-rs/jsonwebtoken (sync)    2.99 µs/iter   3.01 µs         ▂ ▂█         
                                 (2.89 µs … 3.13 µs)   3.10 µs ▂   ▂▅ ▂█ ██ ▅▂      
                             (  1.24 kb …   1.25 kb)   1.25 kb █▇▄▁██▇██▇██▄██▁▇▁▄▁▇

HS256 - @node-rs/jsonwebtoken (async)  11.44 µs/iter  11.59 µs █     █   █          
                               (11.06 µs … 12.16 µs)  11.77 µs █   ▅ █ ▅ █    ▅  ▅ ▅
                             (  1.69 kb …   1.84 kb)   1.71 kb █▁▁▁█▁█▁█▁█▁▁▁▁█▁▁█▁█

summary
  HS256 - fast-jwt (sync)
   1.28x faster than HS256 - @node-rs/jsonwebtoken (sync)
   1.48x faster than HS256 - jsonwebtoken (sync)
   1.8x faster than HS256 - fast-jwt (async)
   2.21x faster than HS256 - jsonwebtoken (async)
   4.9x faster than HS256 - @node-rs/jsonwebtoken (async)
   8.32x faster than HS256 - jose (async)
```
</details>


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.06 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - jose (async)                   18.42 µs/iter  19.42 µs  ▇█                  
                              (15.38 µs … 365.92 µs)  28.71 µs  ██▅ ▂▂              
                             (136.00  b … 436.40 kb)  13.12 kb ▂██████▇▆▅▃▂▂▂▂▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)             3.41 µs/iter   3.40 µs      █▆ ▂            
                                 (3.30 µs … 4.29 µs)   3.53 µs      ██ █            
                             (391.73  b …   3.58 kb)   3.02 kb ▃▁▁▃▁██▃█▇▁▇█▃▁▁▁▃▁▁▃

HS512 - jsonwebtoken (async)            5.86 µs/iter   6.77 µs ▂▂    █              
                                 (4.75 µs … 7.69 µs)   7.39 µs ██    █ ▅        ▅   
                             (  1.41 kb …   7.09 kb)   6.25 kb ██▇▇▇▇█▁█▁▁▁▁▇▇▇▇█▇▁▇

HS512 - fast-jwt (sync)                 2.71 µs/iter   2.68 µs █                    
                                 (2.62 µs … 3.31 µs)   3.15 µs █                    
                             (  1.62 kb …   1.85 kb)   1.64 kb █▇▃▃▂▂▁▂▁▂▂▁▁▁▁▁▁▁▂▃▂

HS512 - fast-jwt (async)                4.54 µs/iter   4.48 µs █                    
                                 (4.06 µs … 5.79 µs)   5.77 µs █▅                   
                             (  3.54 kb …   3.55 kb)   3.54 kb ██▅▃▅▅▁▃▁▁▁▁▁▁▁▃▁▁▁▇▇

HS512 - @node-rs/jsonwebtoken (sync)    3.57 µs/iter   3.57 µs  █                   
                                 (3.52 µs … 3.74 µs)   3.74 µs  █▅▄                 
                             (  1.28 kb …   1.29 kb)   1.29 kb ▆████▃█▁▁▁▃▁▁▅▁▁▁▃▁▁▃

HS512 - @node-rs/jsonwebtoken (async)  10.50 µs/iter  10.53 µs               █      
                               (10.37 µs … 10.69 µs)  10.60 µs ▅▅▅ ▅     ▅▅▅▅█   ▅ ▅
                             (  1.73 kb …   1.73 kb)   1.73 kb ███▁█▁▁▁▁▁█████▁▁▁█▁█

summary
  HS512 - fast-jwt (sync)
   1.26x faster than HS512 - jsonwebtoken (sync)
   1.31x faster than HS512 - @node-rs/jsonwebtoken (sync)
   1.67x faster than HS512 - fast-jwt (async)
   2.16x faster than HS512 - jsonwebtoken (async)
   3.87x faster than HS512 - @node-rs/jsonwebtoken (async)
   6.79x faster than HS512 - jose (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.17 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
ES512 - jose (async)           1.56 ms/iter   1.55 ms  █                   
                        (1.54 ms … 1.94 ms)   1.72 ms ▅█                   
                    ( 15.81 kb … 664.82 kb)  21.42 kb ██▅▂▁▂▂▂▂▂▁▂▂▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (sync)    1.52 ms/iter   1.52 ms   █                  
                        (1.51 ms … 1.69 ms)   1.57 ms  ███                 
                    (  6.14 kb … 658.03 kb)  10.77 kb ▂████▅▂▂▁▂▂▁▁▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (async)   1.52 ms/iter   1.52 ms  █                   
                        (1.51 ms … 1.64 ms)   1.59 ms  █▄                  
                    ( 10.07 kb …   1.13 mb)  21.00 kb ▆██▆▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (sync)        1.52 ms/iter   1.52 ms  █                   
                        (1.51 ms … 1.67 ms)   1.61 ms  █                   
                    (  2.73 kb …  37.20 kb)   3.73 kb ▇██▅▂▂▁▁▁▁▁▁▁▁▁▂▁▁▁▁▁

ES512 - fast-jwt (async)       1.56 ms/iter   1.56 ms  █                   
                        (1.54 ms … 1.75 ms)   1.68 ms  █▆                  
                    (  5.34 kb … 309.03 kb)   9.12 kb ▇██▆▂▂▁▂▂▁▁▁▁▁▁▂▁▁▁▁▁

summary
  ES512 - jsonwebtoken (sync)
   1x faster than ES512 - jsonwebtoken (async)
   1x faster than ES512 - fast-jwt (sync)
   1.02x faster than ES512 - jose (async)
   1.02x faster than ES512 - fast-jwt (async)
```
</details>


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.16 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
RS512 - jose (async)                    3.40 ms/iter   3.38 ms █                    
                                 (3.35 ms … 4.19 ms)   4.18 ms █                    
                             (  1.52 kb … 292.09 kb)  23.85 kb █▇▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)             3.40 ms/iter   3.41 ms █                    
                                 (3.32 ms … 4.45 ms)   4.14 ms █                    
                             (  8.17 kb … 113.60 kb)   9.21 kb ██▃▄▃▃▁▂▂▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (async)            3.36 ms/iter   3.34 ms █                    
                                 (3.32 ms … 4.15 ms)   4.14 ms █                    
                             ( 12.24 kb …   1.17 mb)  19.11 kb █▄▂▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (sync)                 3.37 ms/iter   3.34 ms █                    
                                 (3.32 ms … 4.15 ms)   4.14 ms █                    
                             (  4.66 kb … 111.18 kb)   5.23 kb █▅▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - fast-jwt (async)                4.23 ms/iter   4.22 ms  ▂█                  
                                 (4.18 ms … 4.51 ms)   4.44 ms  ██▅                 
                             ( 10.11 kb … 150.40 kb)  12.79 kb ▃███▅▃▁▂▁▂▁▂▁▂▃▁▁▁▁▁▂

RS512 - @node-rs/jsonwebtoken (sync)    3.36 ms/iter   3.36 ms  ▇█                  
                                 (3.35 ms … 3.44 ms)   3.41 ms ▃███▂                
                             (  2.32 kb …   4.57 kb)   2.34 kb ██████▅▅▄▁▂▂▃▃▃▂▂▁▁▁▂

RS512 - @node-rs/jsonwebtoken (async)   3.38 ms/iter   3.38 ms  █                   
                                 (3.36 ms … 3.49 ms)   3.48 ms  █▇▂                 
                             (  2.76 kb …   5.32 kb)   2.80 kb ████▇▂▃▂▂▂▂▁▁▂▁▁▁▁▁▁▁

summary
  RS512 - @node-rs/jsonwebtoken (sync)
   1x faster than RS512 - jsonwebtoken (async)
   1x faster than RS512 - fast-jwt (sync)
   1.01x faster than RS512 - @node-rs/jsonwebtoken (async)
   1.01x faster than RS512 - jose (async)
   1.01x faster than RS512 - jsonwebtoken (sync)
   1.26x faster than RS512 - fast-jwt (async)
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
PS512 - jose (async)                    3.39 ms/iter   3.37 ms █                    
                                 (3.34 ms … 4.31 ms)   4.15 ms █                    
                             ( 21.02 kb …  95.48 kb)  22.82 kb ██▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)             3.35 ms/iter   3.34 ms █                    
                                 (3.32 ms … 4.15 ms)   4.12 ms █                    
                             (  7.16 kb … 113.63 kb)   8.91 kb █▆▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)            3.36 ms/iter   3.34 ms █                    
                                 (3.32 ms … 4.15 ms)   4.14 ms █                    
                             ( 11.13 kb …   1.13 mb)  20.43 kb █▄▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync)                 3.37 ms/iter   3.34 ms █                    
                                 (3.32 ms … 4.17 ms)   4.14 ms █                    
                             (  4.42 kb …  78.12 kb)   5.30 kb █▅▂▂▁▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (async)                4.21 ms/iter   4.22 ms   █▄                 
                                 (4.18 ms … 4.54 ms)   4.41 ms  ▃██                 
                             (  9.75 kb … 281.23 kb)  13.31 kb ▄████▅▁▃▂▂▂▁▁▁▁▁▁▁▁▁▁

PS512 - @node-rs/jsonwebtoken (sync)    3.37 ms/iter   3.37 ms  █▂                  
                                 (3.35 ms … 3.49 ms)   3.44 ms  ██                  
                             (  2.32 kb …   2.55 kb)   2.32 kb ▄███▆▄▁▁▂▂▂▂▂▁▁▁▁▁▂▁▁

PS512 - @node-rs/jsonwebtoken (async)   3.38 ms/iter   3.38 ms  ▇█                  
                                 (3.37 ms … 3.52 ms)   3.44 ms  ██▆ ▂               
                             (  2.76 kb …   3.03 kb)   2.76 kb ▅███▇█▄▂▁▁▁▁▁▁▁▁▁▂▁▁▁

summary
  PS512 - jsonwebtoken (sync)
   1x faster than PS512 - jsonwebtoken (async)
   1x faster than PS512 - @node-rs/jsonwebtoken (sync)
   1.01x faster than PS512 - fast-jwt (sync)
   1.01x faster than PS512 - @node-rs/jsonwebtoken (async)
   1.01x faster than PS512 - jose (async)
   1.26x faster than PS512 - fast-jwt (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.17 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - jose (async)                   51.20 µs/iter  52.38 µs    █▃█▃              
                              (45.96 µs … 280.17 µs)  62.42 µs   ▆████▆▅▂           
                             (792.00  b … 316.41 kb)  14.26 kb ▁▃████████▆▅▄▃▃▂▂▁▁▁▁

EdDSA - fast-jwt (sync)                31.01 µs/iter  30.88 µs          █           
                               (30.19 µs … 33.67 µs)  31.56 µs          █           
                             (  1.94 kb …   2.20 kb)   2.02 kb ██▁▁███▁▁██▁▁▁▁▁▁▁█▁█

EdDSA - fast-jwt (async)               74.45 µs/iter  75.17 µs  █    ▅▂             
                              (71.67 µs … 249.21 µs)  81.08 µs  █▃   ██             
                             (512.00  b … 280.82 kb)   5.06 kb ▅██▃▂▃██▆▃▃▅▇▃▂▂▂▂▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)   29.25 µs/iter  29.25 µs █                    
                               (28.93 µs … 30.19 µs)  30.16 µs █▅                   
                             (  1.29 kb …   1.29 kb)   1.29 kb ██▇▇▁▇▁▁▁▇▁▁▁▁▁▁▁▁▁▁▇

EdDSA - @node-rs/jsonwebtoken (async)  40.23 µs/iter  40.79 µs   ▃ █▆               
                              (37.67 µs … 111.83 µs)  46.25 µs   █▅██▄▆             
                             (  2.13 kb …  98.13 kb)   2.16 kb ▁▃███████▇▆▄▃▃▂▂▁▁▁▁▁

summary
  EdDSA - @node-rs/jsonwebtoken (sync)
   1.06x faster than EdDSA - fast-jwt (sync)
   1.38x faster than EdDSA - @node-rs/jsonwebtoken (async)
   1.75x faster than EdDSA - jose (async)
   2.54x faster than EdDSA - fast-jwt (async)
```
</details>


## Decoding


<details>
    <summary>RS512</summary>

## RS512
```
clk: ~3.17 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                      avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------- -------------------------------
RS512 - fast-jwt                  1.59 µs/iter   1.59 µs  █                   
                           (1.56 µs … 1.70 µs)   1.68 µs  █▃                  
                       (393.54  b … 621.54  b) 506.16  b ▆██▅▇▅▄▂▂▂▄▃▁▂▂▁▁▁▁▁▂

RS512 - fast-jwt (complete)       1.59 µs/iter   1.59 µs  █                   
                           (1.57 µs … 1.69 µs)   1.67 µs ▂█▅                  
                       (465.80  b … 725.60  b) 594.24  b ███▇▄▂▁▃▂▂▂▂▄▁▂▃▂▁▂▁▂

RS512 - jsonwebtoken              1.73 µs/iter   1.74 µs  █▆                  
                           (1.71 µs … 1.80 µs)   1.78 µs  ██▃                 
                       (655.40  b …   1.16 kb) 894.53  b ▄███▅▅▂▃▂▄▄▅▄▂▃▂▃▃▁▂▂

RS512 - jsonwebtoken (complete)   1.72 µs/iter   1.72 µs  █▃                  
                           (1.70 µs … 1.82 µs)   1.77 µs  ██                  
                       (771.36  b …   1.07 kb) 895.58  b ▄█████▄▄▂▂▁▁▃▁▂▂▂▂▃▁▂

RS512 - jose                    597.02 ns/iter 595.88 ns  ▆█                  
                       (588.27 ns … 662.38 ns) 648.36 ns ▅██                  
                       (334.71  b … 859.24  b) 570.95  b ███▆▄▃▃▂▂▂▂▂▁▂▁▂▁▂▁▂▁

RS512 - jose (complete)           1.14 µs/iter   1.14 µs  █                   
                           (1.13 µs … 1.20 µs)   1.20 µs  █▃                  
                       (860.47  b …   1.43 kb)   1.07 kb ███▆▄▂▂▂▃▂▁▁▂▁▁▁▁▁▂▁▁

summary
  RS512 - jose
   1.91x faster than RS512 - jose (complete)
   2.66x faster than RS512 - fast-jwt
   2.67x faster than RS512 - fast-jwt (complete)
   2.88x faster than RS512 - jsonwebtoken (complete)
   2.9x faster than RS512 - jsonwebtoken
```
</details>


Only RS512 was measured for decoding.

These decoding numbers are not a like-for-like comparison. `createDecoder()` also decodes and parses
the header, which it needs for the `checkTyp` option and for the `complete` form, and it rejects any
of the three segments containing characters outside the base64url alphabet, so that a non canonical
token cannot be silently accepted. `jose`'s `decodeJwt` does neither: it reads the payload only. The
alphabet check also scans the signature, so the cost grows with signature length, and RS512 has the
longest signature of the algorithms benchmarked here — measured across all of them, the gap ranges
from 1.66x for HS256 to 3.06x for PS512. The `(complete)` rows are the closest to an equal
comparison, since only there does `jose` decode the header as well.

## Verifying


<details>
    <summary>HS256</summary>

## HS256
```
clk: ~3.18 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS256 - fast-jwt (sync)                 2.77 µs/iter   2.84 µs  ▆█                  
                                 (2.71 µs … 3.09 µs)   2.89 µs ▅██            █     
                             (  1.33 kb …   1.74 kb)   1.34 kb ███▅▃▁▁▃▁▁▁▃▁▁▅█▆▅▃▅▃

HS256 - fast-jwt (async)                5.64 µs/iter   5.72 µs ▂█ █▂  █             
                                 (4.90 µs … 7.39 µs)   7.39 µs ██▅██  █             
                             (  1.10 kb …   3.81 kb)   3.51 kb █████▇▇█▁▁▁▁▁▁▇▁▇▁▁▇▇

HS256 - fast-jwt (sync with cache)      1.18 µs/iter   1.13 µs    █                 
                               (958.00 ns … 5.27 ms)   1.92 µs   ▆█                 
                             (  1.37 kb … 161.57 kb)   1.42 kb ▁▂██▅▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

HS256 - fast-jwt (async with cache)     1.32 µs/iter   1.25 µs █▆                   
                                 (1.17 µs … 2.34 µs)   2.29 µs ██                   
                             (  1.10 kb …   2.41 kb)   1.76 kb ██▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▂▃▂▂

HS256 - jose (async)                   18.58 µs/iter  19.13 µs   █▃                 
                              (14.50 µs … 270.75 µs)  37.17 µs  ▇██▄                
                             (  1.18 kb … 611.70 kb)  12.21 kb ▂████▇▅▃▂▂▁▁▁▁▁▁▁▁▁▁▁

HS256 - jsonwebtoken (sync)             4.13 µs/iter   4.23 µs   ▄▄█                
                                 (3.89 µs … 4.65 µs)   4.59 µs   ████               
                             (  3.54 kb …   3.59 kb)   3.55 kb █▅█████▅▁▅█▅█▅▁▁▁▅▅▅▅

HS256 - jsonwebtoken (async)            4.35 µs/iter   4.47 µs     █                
                                 (4.14 µs … 4.71 µs)   4.68 µs  ▃ ▆█▃      ▃     ▃  
                             (  4.12 kb …   4.68 kb)   4.14 kb ▄█████▄▄▁▄▄▄█▁▄▄▄▁█▁▄

HS256 - @node-rs/jsonwebtoken (sync)    3.22 µs/iter   3.23 µs     █▂ █▂  ▂ ▂ █▂  ▂ 
                                 (3.20 µs … 3.25 µs)   3.24 µs ▅▅▅▅██ ██▅ █▅█ ██▅ █ 
                             (342.63  b … 352.32  b) 351.80  b ██████▇███▇███▇███▇█▇

HS256 - @node-rs/jsonwebtoken (async)  10.67 µs/iter  11.50 µs  █▂                  
                               (8.21 µs … 643.88 µs)  21.46 µs  ██▂                 
                             (  1.18 kb … 150.70 kb)   1.36 kb ▃████▆▆▅▃▃▂▂▁▁▁▁▁▁▁▁▁

summary
  HS256 - fast-jwt (sync with cache)
   1.12x faster than HS256 - fast-jwt (async with cache)
   2.36x faster than HS256 - fast-jwt (sync)
   2.74x faster than HS256 - @node-rs/jsonwebtoken (sync)
   3.51x faster than HS256 - jsonwebtoken (sync)
   3.7x faster than HS256 - jsonwebtoken (async)
   4.8x faster than HS256 - fast-jwt (async)
   9.08x faster than HS256 - @node-rs/jsonwebtoken (async)
   15.81x faster than HS256 - jose (async)
```
</details>


<details>
    <summary>HS512</summary>

## HS512
```
clk: ~3.07 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
HS512 - fast-jwt (sync)                 3.31 µs/iter   3.39 µs     ▂███  ████▂      
                                 (3.07 µs … 3.83 µs)   3.58 µs ▅  ▅████  █████▅    ▅
                             (  1.67 kb …   1.77 kb)   1.69 kb █▇▇█████▇▇██████▇▁▁▁█

HS512 - fast-jwt (async)                6.79 µs/iter   7.54 µs █                    
                                 (5.38 µs … 9.12 µs)   9.04 µs █▅  ▅  ▅    ▅ ▅      
                             (978.65  b …   3.79 kb)   3.42 kb ██▇▁█▇▁█▇▁▇▁█▁█▁▁▁▁▇▇

HS512 - fast-jwt (sync with cache)      1.31 µs/iter   1.22 µs █                    
                                 (1.16 µs … 3.18 µs)   3.13 µs █                    
                             (803.68  b …   1.13 kb) 932.42  b ██▁▁▂▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁▂

HS512 - fast-jwt (async with cache)     1.46 µs/iter   1.39 µs █▄                   
                                 (1.32 µs … 2.58 µs)   2.48 µs ██                   
                             (  1.50 kb …   1.75 kb)   1.63 kb ██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▃▂

HS512 - jose (async)                   18.11 µs/iter  18.54 µs  ██                  
                              (14.92 µs … 212.92 µs)  34.04 µs  ██▆                 
                             (  1.02 kb … 367.02 kb)  12.06 kb ▂████▆▅▄▂▂▁▁▁▁▁▁▁▁▁▁▁

HS512 - jsonwebtoken (sync)             4.03 µs/iter   4.12 µs  █ ▄▄                
                                 (3.89 µs … 5.41 µs)   4.22 µs █████                
                             (  3.62 kb …   3.92 kb)   3.77 kb █████▅▁▅▅▁▁▁▅▁████▅▁▅

HS512 - jsonwebtoken (async)            4.22 µs/iter   4.32 µs      █               
                                 (4.10 µs … 4.41 µs)   4.39 µs  ▃ ███ ▃            ▃
                             (  4.31 kb …   4.31 kb)   4.31 kb ▄█▄███▁█▄▁▁▁▄▁▁▁█▄█▄█

HS512 - @node-rs/jsonwebtoken (sync)    3.76 µs/iter   3.77 µs   █                  
                                 (3.70 µs … 3.93 µs)   3.90 µs   █ ▂                
                             (342.53  b … 352.14  b) 351.75  b ██████▃█▃▃▆▁▃▆▃▆▁▁▁▁▃

HS512 - @node-rs/jsonwebtoken (async)  10.79 µs/iter  10.70 µs     █                
                               (10.52 µs … 11.83 µs)  11.05 µs ▅▅▅▅█  ▅  ▅         ▅
                             (800.20  b … 804.05  b) 800.84  b █████▁▁█▁▁█▁▁▁▁▁▁▁▁▁█

summary
  HS512 - fast-jwt (sync with cache)
   1.12x faster than HS512 - fast-jwt (async with cache)
   2.54x faster than HS512 - fast-jwt (sync)
   2.88x faster than HS512 - @node-rs/jsonwebtoken (sync)
   3.09x faster than HS512 - jsonwebtoken (sync)
   3.23x faster than HS512 - jsonwebtoken (async)
   5.2x faster than HS512 - fast-jwt (async)
   8.26x faster than HS512 - @node-rs/jsonwebtoken (async)
   13.87x faster than HS512 - jose (async)
```
</details>


<details>
    <summary>ES512</summary>

## ES512
```
clk: ~3.18 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                          avg (min … max) p75 / p99    (min … top 1%)
-------------------------------------------------- -------------------------------
ES512 - fast-jwt (sync)               1.17 ms/iter   1.16 ms  █                   
                               (1.15 ms … 1.35 ms)   1.29 ms  █                   
                           (  2.53 kb … 608.27 kb)   4.92 kb ██▅▃▂▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async)              1.22 ms/iter   1.25 ms  █                   
                               (1.18 ms … 1.50 ms)   1.40 ms ▃█                   
                           (  4.72 kb …   1.12 mb)  10.42 kb ███▇▄▅▄▄▄▃▃▃▂▂▁▂▂▁▁▁▁

ES512 - fast-jwt (sync with cache)    1.40 µs/iter   1.38 µs   █                  
                              (1.21 µs … 73.67 µs)   2.42 µs  ██▅                 
                           (  1.27 kb … 138.95 kb)   1.29 kb ▁███▃▂▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁

ES512 - fast-jwt (async with cache)   1.66 µs/iter   1.58 µs     █                
                               (1.38 µs … 1.61 ms)   2.08 µs     █▇               
                           (  2.00 kb … 114.02 kb)   2.14 kb ▁▁▇▁███▅▃▂▁▂▁▁▁▁▁▁▁▁▁

ES512 - jose (async)                  1.20 ms/iter   1.20 ms  █                   
                               (1.18 ms … 1.40 ms)   1.31 ms  ██▃                 
                           ( 14.28 kb … 560.80 kb)  19.33 kb ▆███▅▄▃▃▃▃▂▂▂▂▂▁▁▁▁▁▁

ES512 - jsonwebtoken (sync)           1.18 ms/iter   1.18 ms  █                   
                               (1.15 ms … 1.42 ms)   1.30 ms  █                   
                           (  4.27 kb … 562.50 kb)   6.17 kb ███▆▄▃▃▂▃▂▂▂▂▁▁▁▁▁▁▁▁

ES512 - jsonwebtoken (async)          1.18 ms/iter   1.18 ms  █                   
                               (1.15 ms … 1.49 ms)   1.30 ms  █                   
                           (  4.87 kb … 184.59 kb)   5.37 kb ███▆▇▃▃▃▂▂▂▂▂▁▂▁▁▁▂▁▁

summary
  ES512 - fast-jwt (sync with cache)
   1.18x faster than ES512 - fast-jwt (async with cache)
   831.15x faster than ES512 - fast-jwt (sync)
   839.56x faster than ES512 - jsonwebtoken (sync)
   841.09x faster than ES512 - jsonwebtoken (async)
   855.58x faster than ES512 - jose (async)
   871.5x faster than ES512 - fast-jwt (async)
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
RS512 - fast-jwt (sync)                57.13 µs/iter  57.96 µs  █                   
                               (55.86 µs … 59.70 µs)  58.17 µs ██                   
                             (  1.85 kb …   2.10 kb)   1.91 kb ██▁▁▁▁▁▁▁▁▁█▁██▁▁▁███

RS512 - fast-jwt (async)               91.77 µs/iter  92.67 µs  █                   
                              (89.17 µs … 148.00 µs) 100.92 µs  █▇  ▂▃              
                             (  4.79 kb … 260.97 kb)   5.36 kb ▃██▆▄██▅▃▂▃▃▂▂▁▁▁▁▁▁▁

RS512 - fast-jwt (sync with cache)      1.86 µs/iter   1.76 µs █                    
                                 (1.72 µs … 3.04 µs)   2.70 µs █                    
                             (930.91  b …   1.04 kb) 940.57  b █▅▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▄▁

RS512 - fast-jwt (async with cache)     2.00 µs/iter   1.92 µs █                    
                                 (1.88 µs … 2.95 µs)   2.95 µs █                    
                             (  1.32 kb …   1.97 kb)   1.62 kb █▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▃

RS512 - jose (async)                   77.16 µs/iter  77.54 µs   █▅                 
                              (74.63 µs … 251.08 µs)  88.00 µs  ████▃               
                             (  2.97 kb … 367.58 kb)  15.64 kb ▃█████▆▃▂▂▁▁▁▁▁▁▁▁▁▁▁

RS512 - jsonwebtoken (sync)            59.27 µs/iter  59.25 µs   █                  
                              (57.67 µs … 178.46 µs)  65.54 µs  ▇█▅                 
                             (240.00  b … 274.52 kb)   9.22 kb ▂███▅▃▄▃▂▁▂▂▄▂▁▁▁▁▁▁▁

RS512 - jsonwebtoken (async)           58.44 µs/iter  58.38 µs   █                  
                               (57.69 µs … 60.30 µs)  60.18 µs ███                  
                             (  8.36 kb …   8.36 kb)   8.36 kb ███▁█▁█▁▁▁▁▁▁▁█▁▁▁▁▁█

RS512 - @node-rs/jsonwebtoken (sync)   77.02 µs/iter  76.96 µs  █                   
                              (76.54 µs … 108.54 µs)  80.75 µs  ██                  
                             (352.00  b … 548.89 kb) 875.64  b ▃██▄▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

RS512 - @node-rs/jsonwebtoken (async)  88.70 µs/iter  89.08 µs  █                   
                              (86.96 µs … 154.21 µs)  96.17 µs  █▃▅▃                
                             (848.00  b … 128.83 kb)   1.20 kb ▃████▇▆▄▂▂▂▁▁▁▁▁▁▁▁▁▁

summary
  RS512 - fast-jwt (sync with cache)
   1.08x faster than RS512 - fast-jwt (async with cache)
   30.8x faster than RS512 - fast-jwt (sync)
   31.5x faster than RS512 - jsonwebtoken (async)
   31.95x faster than RS512 - jsonwebtoken (sync)
   41.52x faster than RS512 - @node-rs/jsonwebtoken (sync)
   41.59x faster than RS512 - jose (async)
   47.81x faster than RS512 - @node-rs/jsonwebtoken (async)
   49.46x faster than RS512 - fast-jwt (async)
```
</details>


<details>
    <summary>PS512</summary>

## PS512
```
clk: ~3.15 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
PS512 - fast-jwt (sync)                58.54 µs/iter  58.58 µs   █                  
                              (57.29 µs … 177.46 µs)  63.42 µs  ██▃                 
                             (  1.78 kb … 364.69 kb)   3.51 kb ▁████▃▃▅▃▃▂▂▁▁▁▁▁▁▁▁▁

PS512 - fast-jwt (async)               93.93 µs/iter  94.88 µs  █                   
                              (90.21 µs … 214.75 µs) 108.71 µs  █▅▄▅                
                             (792.00  b … 292.64 kb)   5.55 kb ▃████▇▆▅▃▃▃▂▂▁▁▁▁▁▁▁▁

PS512 - fast-jwt (sync with cache)      1.72 µs/iter   1.62 µs █                    
                                 (1.58 µs … 2.59 µs)   2.55 µs █                    
                             (922.76  b …   1.09 kb) 989.22  b █▆▁▂▁▁▂▁▁▁▁▁▁▁▁▁▁▁▄▂▁

PS512 - fast-jwt (async with cache)     1.88 µs/iter   1.83 µs █                    
                                 (1.75 µs … 2.91 µs)   2.86 µs █                    
                             (  1.40 kb …   1.75 kb)   1.67 kb █▅▃▃▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▂

PS512 - jose (async)                   80.12 µs/iter  80.33 µs  ▇█▂                 
                              (77.33 µs … 280.33 µs)  93.29 µs  ███▂                
                             (  2.43 kb … 396.48 kb)  18.03 kb ▃████▆▃▂▂▃▂▂▁▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (sync)            60.39 µs/iter  60.21 µs   █                  
                              (58.92 µs … 166.00 µs)  66.54 µs   █                  
                             (  2.09 kb … 343.73 kb)   9.27 kb ▁▄██▃▂▂▃▂▂▂▁▂▁▁▁▁▁▁▁▁

PS512 - jsonwebtoken (async)           59.71 µs/iter  59.71 µs        ██            
                               (59.35 µs … 60.95 µs)  59.96 µs ▅▅ ▅  ▅██   ▅      ▅▅
                             (113.98  b …   8.27 kb)   6.91 kb ██▁█▁▁███▁▁▁█▁▁▁▁▁▁██

PS512 - @node-rs/jsonwebtoken (sync)   78.03 µs/iter  77.92 µs  █                   
                              (77.46 µs … 191.58 µs)  82.21 µs  ██                  
                             (328.00  b … 192.37 kb) 671.76  b ▂██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

PS512 - @node-rs/jsonwebtoken (async)  89.45 µs/iter  89.88 µs   ▆█▂▇▅              
                              (87.71 µs … 162.83 µs)  93.17 µs   ██████▆▃           
                             (824.00  b … 128.80 kb)   1.15 kb ▁▂█████████▆▄▄▂▂▁▁▁▁▁

summary
  PS512 - fast-jwt (sync with cache)
   1.1x faster than PS512 - fast-jwt (async with cache)
   34.11x faster than PS512 - fast-jwt (sync)
   34.79x faster than PS512 - jsonwebtoken (async)
   35.18x faster than PS512 - jsonwebtoken (sync)
   45.46x faster than PS512 - @node-rs/jsonwebtoken (sync)
   46.68x faster than PS512 - jose (async)
   52.12x faster than PS512 - @node-rs/jsonwebtoken (async)
   54.73x faster than PS512 - fast-jwt (async)
```
</details>


<details>
    <summary>EdDSA</summary>

## EdDSA
```
clk: ~3.18 GHz
cpu: Apple M1 Pro
runtime: node 24.14.1 (arm64-darwin)

benchmark                            avg (min … max) p75 / p99    (min … top 1%)
---------------------------------------------------- -------------------------------
EdDSA - fast-jwt (sync)                86.24 µs/iter  86.04 µs  █                   
                              (84.88 µs … 153.46 µs)  93.50 µs  ██                  
                             (  1.81 kb … 476.18 kb)   3.10 kb ▂██▅▂▃▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (async)               96.38 µs/iter  96.79 µs  █                   
                              (93.96 µs … 226.58 µs) 110.96 µs  █▅                  
                             (  3.82 kb … 292.00 kb)   5.04 kb ▄███▅▅▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁

EdDSA - fast-jwt (sync with cache)      1.36 µs/iter   1.24 µs █                    
                                 (1.22 µs … 2.12 µs)   2.07 µs █                    
                             (  1.03 kb …   1.45 kb)   1.08 kb █▂▂▁▁▁▁▁▂▁▁▁▁▁▁▁▁▁▄▂▂

EdDSA - fast-jwt (async with cache)     1.55 µs/iter   1.50 µs █                    
                                 (1.39 µs … 2.77 µs)   2.43 µs █                    
                             (  1.68 kb …   1.92 kb)   1.80 kb ██▄▃▂▂▁▂▁▁▁▁▁▁▁▁▁▁▃▃▁

EdDSA - jose (async)                  105.32 µs/iter 105.79 µs   ▂██                
                             (102.00 µs … 314.75 µs) 116.92 µs  ▅████▂              
                             (  3.40 kb … 399.16 kb)  12.38 kb ▂██████▆▃▃▂▂▁▁▁▁▁▁▁▁▁

EdDSA - @node-rs/jsonwebtoken (sync)   40.86 µs/iter  40.85 µs    █ █               
                               (40.65 µs … 41.83 µs)  41.00 µs ▅ ▅█ █ ▅▅   ▅▅      ▅
                             (352.02  b … 352.04  b) 352.03  b █▁██▁█▁██▁▁▁██▁▁▁▁▁▁█

EdDSA - @node-rs/jsonwebtoken (async)  53.33 µs/iter  53.79 µs   █                  
                              (49.33 µs … 146.58 µs)  73.04 µs  ▅█▆                 
                             (848.00  b …  96.83 kb)   1.18 kb ▁████▅▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁

summary
  EdDSA - fast-jwt (sync with cache)
   1.14x faster than EdDSA - fast-jwt (async with cache)
   30.15x faster than EdDSA - @node-rs/jsonwebtoken (sync)
   39.35x faster than EdDSA - @node-rs/jsonwebtoken (async)
   63.64x faster than EdDSA - fast-jwt (sync)
   71.12x faster than EdDSA - fast-jwt (async)
   77.72x faster than EdDSA - jose (async)
```
</details>

