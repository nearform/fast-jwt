#!-bin-sh

# CLEAN UP
rm -f *.key *.pub

# RSA
ssh-keygen -P '' -t rsa -b 4096 -m PEM -f rs-private.key
openssl rsa -in rs-private.key -pubout -outform PEM -out rs-public.key
# PS
ssh-keygen -P '' -t rsa -b 4096 -m PEM -f ps-private.key
openssl rsa -in ps-private.key -pubout -outform PEM -RSAPublicKey_out -out ps-public.key
# ES
openssl ecparam -genkey -name prime256v1 -noout -out es-private.key
openssl ec -in es-private.key -pubout -out es-public.key

# CLEAN UP
rm -f *.pub