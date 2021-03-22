
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.3.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure initial token distribution works",
    async fn(chain: Chain, accounts: Array<Account>) {
        let block = chain.mineBlock([
            Tx.contractCall("swag-nft", "get-last-token-id", [], accounts[0].address),
            Tx.contractCall("swag-nft", "get-owner", [types.uint(1)], accounts[0].address),
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result, "(ok u3)");
        assertEquals(block.receipts[1].result, "(ok (some ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH))");
        assertEquals(block.height, 2);
    },
});
