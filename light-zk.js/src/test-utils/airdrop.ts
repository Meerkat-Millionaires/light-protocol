import { BN } from "@coral-xyz/anchor";
import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  ADMIN_AUTH_KEYPAIR,
  ConfirmOptions,
  MINT,
  Provider,
  TestRelayer,
  TOKEN_PUBKEY_SYMBOL,
  User,
  confirmConfig,
  confirmTransaction,
  RELAYER_FEE,
} from "../index";

export async function airdropShieldedSol({
  provider,
  amount,
  seed,
  recipientPublicKey,
}: {
  provider?: Provider;
  amount: number;
  seed?: string;
  recipientPublicKey?: string;
}) {
  if (!amount) throw new Error("Sol Airdrop amount undefined");
  if (!seed && !recipientPublicKey)
    throw new Error(
      "Sol Airdrop seed and recipientPublicKey undefined define a seed to airdrop shielded sol aes encrypted, define a recipientPublicKey to airdrop shielded sol to the recipient nacl box encrypted",
    );
  const relayer = new TestRelayer({
    relayerPubkey: ADMIN_AUTH_KEYPAIR.publicKey,
    relayerRecipientSol: Keypair.generate().publicKey,
    relayerFee: RELAYER_FEE,
    payer: ADMIN_AUTH_KEYPAIR,
  });
  if (!provider) {
    provider = await Provider.init({
      wallet: ADMIN_AUTH_KEYPAIR,
      relayer: relayer,
      confirmConfig,
    });
  }
  const userKeypair = Keypair.generate();
  await airdropSol({
    connection: provider.provider!.connection,
    recipientPublicKey: userKeypair.publicKey,
    lamports: amount * 1e9,
  });

  const user: User = await User.init({ provider, seed });
  return await user.shield({
    publicAmountSol: amount,
    token: "SOL",
    recipient: recipientPublicKey,
  });
}

export async function airdropSol({
  connection,
  lamports,
  recipientPublicKey,
}: {
  connection: Connection;
  lamports: number;
  recipientPublicKey: PublicKey;
}) {
  const txHash = await connection.requestAirdrop(recipientPublicKey, lamports);
  await confirmTransaction(connection, txHash);
  return txHash;
}

/**
 * airdrops shielded spl tokens from ADMIN_AUTH_KEYPAIR to the user specified by seed if aes encrypted desired, or by recipient pubkey if nacl box encrypted (will be in utxoInbox then)
 * @param param0
 * @returns
 */
export async function airdropShieldedMINTSpl({
  provider,
  amount,
  seed,
  recipientPublicKey,
}: {
  provider?: Provider;
  amount: number;
  seed?: string;
  recipientPublicKey?: string;
}) {
  if (!amount) throw new Error("Sol Airdrop amount undefined");
  if (!seed && !recipientPublicKey)
    throw new Error(
      "Sol Airdrop seed and recipientPublicKey undefined define a seed to airdrop shielded sol aes encrypted, define a recipientPublicKey to airdrop shielded sol to the recipient nacl box encrypted",
    );
  const relayer = new TestRelayer({
    relayerPubkey: ADMIN_AUTH_KEYPAIR.publicKey,
    relayerRecipientSol: Keypair.generate().publicKey,
    relayerFee: RELAYER_FEE,
    payer: ADMIN_AUTH_KEYPAIR,
  });
  if (!provider) {
    provider = await Provider.init({
      wallet: ADMIN_AUTH_KEYPAIR,
      relayer: relayer,
      confirmConfig,
    });
  }

  let tokenAccount = await getOrCreateAssociatedTokenAccount(
    provider.provider!.connection,
    ADMIN_AUTH_KEYPAIR,
    MINT,
    ADMIN_AUTH_KEYPAIR.publicKey,
  );
  if (new BN(tokenAccount.amount.toString()).toNumber() < amount) {
    await airdropSplToAssociatedTokenAccount(
      provider.provider!.connection,
      1_000_000_000_000 ? amount : 1_000_000_000_000,
      ADMIN_AUTH_KEYPAIR.publicKey,
    );
  }

  const user: User = await User.init({ provider, seed });
  return await user.shield({
    publicAmountSpl: amount,
    token: TOKEN_PUBKEY_SYMBOL.get(MINT.toBase58())!,
    recipient: recipientPublicKey,
    skipDecimalConversions: true,
    confirmOptions: ConfirmOptions.spendable,
  });
}

export async function airdropSplToAssociatedTokenAccount(
  connection: Connection,
  lamports: number,
  recipient: PublicKey,
) {
  let tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    ADMIN_AUTH_KEYPAIR,
    MINT,
    recipient,
  );
  return await mintTo(
    connection,
    ADMIN_AUTH_KEYPAIR,
    MINT,
    tokenAccount.address,
    ADMIN_AUTH_KEYPAIR.publicKey,
    lamports,
    [],
  );
}
