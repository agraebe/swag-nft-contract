
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.3.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Initial token distribution",
    async fn(chain: Chain, accounts: Array<Account>) {
        let block = chain.mineBlock([
            Tx.contractCall("swag-nft", "get-last-token-id", [], accounts[0].address),
            Tx.contractCall("swag-nft", "get-owner", [types.uint(1)], accounts[0].address),
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result, "(ok u3)");
        assertEquals(block.receipts[1].result, "(ok (some ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH))");
    },
});

Clarinet.test({
    name: "NFT metadata availablae",
    async fn(chain: Chain, accounts: Array<Account>) {
        let block = chain.mineBlock([
            Tx.contractCall("swag-nft", "get-token-uri", [types.uint(1)], accounts[0].address),
            Tx.contractCall("swag-nft", "get-meta", [types.uint(1)], accounts[0].address),
            Tx.contractCall("swag-nft", "get-nft-meta", [], accounts[0].address),
        ]);
        assertEquals(block.receipts.length, 3);
        assertEquals(block.receipts[0].result, '(ok (some "https://docs.blockstack.org"))');
        assertEquals(block.receipts[1].result, '(ok (some (tuple (mime-type "video/webm") (name "Clarity Developer OG") (uri "https://assets.website-files.com/5fcf9ac604d37418aa70a5ab/6040d72dcd78ad8f04db36cf_gradioooo-ps-transcode.webm"))))');
        assertEquals(block.receipts[2].result, '(ok (some (tuple (mime-type "video/webm") (name "swag") (uri "https://assets.website-files.com/5fcf9ac604d37418aa70a5ab/6040d72dcd78ad8f04db36cf_gradioooo-ps-transcode.webm"))))');
    },
});

Clarinet.test({
    name: "Transfer between accounts",
    async fn(chain: Chain, accounts: Array<Account>) {
        let block = chain.mineBlock([
            Tx.contractCall("swag-nft", "get-token-uri", [types.uint(1)], accounts[0].address),
        ]);
        assertEquals(block.receipts.length, 3);
        assertEquals(block.receipts[0].result, '(ok (some "https://docs.blockstack.org"))');
    },
});

/*
missing:
- transfer
- mint
- balance-of
*/
