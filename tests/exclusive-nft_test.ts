
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.6.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that developer contract is registered",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
        ]);
        assertEquals(block.receipts.length, 0);
        assertEquals(block.height, 2);

        let call = await chain.callReadOnlyFn("exclusive-swag-nft", "get-registration", [types.principal(wallet_1.address)], wallet_1.address);
        let auctions = call.result
            .expectOk()
            .expectSome({ claimed: false });
    },
});
