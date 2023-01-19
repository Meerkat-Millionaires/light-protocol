#!/bin/bash -e
POWERS_OF_TAU=17 # circuit will support max 2^POWERS_OF_TAU constraints
if [ ! -f ./ptau$POWERS_OF_TAU ]; then
  echo "Downloading powers of tau file"
  curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_$POWERS_OF_TAU.ptau --create-dirs -o ./$POWERS_OF_TAU
fi
circom --r1cs --wasm circuits/transaction$1$2.circom -o ../light-sdk-ts/build-circuits/
npx snarkjs groth16 setup ../light-sdk-ts/build-circuits/transaction$1$2.r1cs ./ptau$POWERS_OF_TAU ../light-sdk-ts/build-circuits/tmp_transaction$1$2.zkey
npx snarkjs zkey contribute ../light-sdk-ts/build-circuits/tmp_transaction$1$2.zkey ../light-sdk-ts/build-circuits/transaction$1$2.zkey -e="321432151325321543215"
npx snarkjs zkey verify ../light-sdk-ts/build-circuits/transaction$1$2.r1cs ptau$POWERS_OF_TAU ../light-sdk-ts/build-circuits/transaction$1$2.zkey
npx snarkjs zkey export verificationkey ../light-sdk-ts/build-circuits/transaction$1$2.zkey verification_key_mainnet$2.json
node parse_pvk_to_bytes_254.js $2
rm verification_key_mainnet$2.json
rm ./transaction$1$2.r1cs
rm ./tmp_transaction$1$2.zkey