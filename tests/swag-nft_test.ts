
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.3.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Token distribution",
    async fn(chain: Chain, accounts: Array<Account>) {
        let block = chain.mineBlock([
            // start at 0
            Tx.contractCall("swag-nft", "get-last-token-id", [], accounts[0].address),
            // mint
            Tx.contractCall("swag-nft", "claim-swag", [], accounts[0].address),
            // mint
            Tx.contractCall("swag-nft", "claim-swag", [], accounts[1].address),
            // mint
            Tx.contractCall("swag-nft", "claim-swag", [], accounts[2].address),
            // double mint
            Tx.contractCall("swag-nft", "claim-swag", [], accounts[0].address),
            // check balance 
            Tx.contractCall("swag-nft", "get-owner", [types.uint(1)], accounts[0].address),
            Tx.contractCall("swag-nft", "get-owner", [types.uint(5)], accounts[6].address),
            // check last id
            Tx.contractCall("swag-nft", "get-last-token-id", [], accounts[0].address),
        ]);
        assertEquals(block.receipts.length, 8);
        assertEquals(block.receipts[0].result, "(ok u0)");
        assertEquals(block.receipts[1].result, "(ok (ok true))");
        assertEquals(block.receipts[2].result, "(ok (ok true))");
        assertEquals(block.receipts[3].result, "(ok (ok true))");
        assertEquals(block.receipts[4].result, "(err (err u403))");
        assertEquals(block.receipts[5].result, "(ok (some ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH))");
        assertEquals(block.receipts[6].result, "(ok none)");
        assertEquals(block.receipts[7].result, "(ok u3)");
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
            // mint
            Tx.contractCall("swag-nft", "claim-swag", [], accounts[0].address),
            // wrong sender
            Tx.contractCall("swag-nft", "transfer", [types.uint(1), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], accounts[4].address),
            // account does not own token
            Tx.contractCall("swag-nft", "transfer", [types.uint(2), types.principal('ST398MYTA19HSZFCFXWSB9VYAXYJXED4Z9QFKWG4W'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], accounts[0].address),
            // sender equals recipient
            Tx.contractCall("swag-nft", "transfer", [types.uint(1), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH')], accounts[0].address),
            // success
            Tx.contractCall("swag-nft", "transfer", [types.uint(1), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], accounts[0].address),
            // verify owner change
            Tx.contractCall("swag-nft", "get-owner", [types.uint(1)], accounts[6].address),
            // token id does not exist
            Tx.contractCall("swag-nft", "transfer", [types.uint(5), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], accounts[0].address),
        ]);
        assertEquals(block.receipts.length, 7);
        assertEquals(block.receipts[1].result, "(err u401)");
        assertEquals(block.receipts[2].result, "(err u401)");
        assertEquals(block.receipts[3].result, '(err u405)');
        assertEquals(block.receipts[4].result, '(ok true)');
        assertEquals(block.receipts[5].result, '(ok (some ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40))');
        assertEquals(block.receipts[6].result, '(err u404)');
    },
});

Clarinet.test({
    name: "No more than 100 tokens",
    async fn(chain: Chain, accounts: Array<Account>) {
        let blocks = [];

        for (let i = 0; i < 100; i++) {
            blocks.push(
                // mint
                Tx.contractCall("swag-nft", "claim-swag", [], accounts[i].address),
            );
        }

        let block = chain.mineBlock(blocks);

        assertEquals(block.receipts.length, 101);
        assertEquals(block.receipts[100].result, "(err (err u403))");
    },
});