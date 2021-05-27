
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.6.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Token distribution",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_2 = accounts.get("wallet_2")!;
        let wallet_3 = accounts.get("wallet_3")!;
        let wallet_7 = accounts.get("wallet_7")!;
        let block = chain.mineBlock([
            // start at 0
            Tx.contractCall("swag-1000-nft", "get-last-token-id", [], wallet_1.address),
            // mint
            Tx.contractCall("swag-1000-nft", "claim-swag", [], wallet_1.address),
            // mint
            Tx.contractCall("swag-1000-nft", "claim-swag", [], wallet_2.address),
            // mint
            Tx.contractCall("swag-1000-nft", "claim-swag", [], wallet_3.address),
            // double mint
            Tx.contractCall("swag-1000-nft", "claim-swag", [], wallet_1.address),
            // check balance 
            Tx.contractCall("swag-1000-nft", "get-owner", [types.uint(1)], wallet_1.address),
            Tx.contractCall("swag-1000-nft", "get-owner", [types.uint(5)], wallet_7.address),
            // check last id
            Tx.contractCall("swag-1000-nft", "get-last-token-id", [], wallet_1.address),
        ]);
        assertEquals(block.receipts.length, 8);
        assertEquals(block.receipts[0].result, "(ok u0)");
        assertEquals(block.receipts[1].result, "(ok (ok true))");
        assertEquals(block.receipts[2].result, "(ok (ok true))");
        assertEquals(block.receipts[3].result, "(ok (ok true))");
        assertEquals(block.receipts[4].result, "(err (err u403))");
        assertEquals(block.receipts[5].result, "(ok (some ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK))");
        assertEquals(block.receipts[6].result, "(ok none)");
        assertEquals(block.receipts[7].result, "(ok u3)");
    },
});

Clarinet.test({
    name: "NFT metadata availablae",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall("swag-1000-nft", "get-token-uri", [types.uint(1)], wallet_1.address),
            Tx.contractCall("swag-1000-nft", "get-meta", [types.uint(1)], wallet_1.address),
            Tx.contractCall("swag-1000-nft", "get-nft-meta", [], wallet_1.address),
        ]);
        assertEquals(block.receipts.length, 3);
        assertEquals(block.receipts[0].result, '(ok (some "https://docs.blockstack.org"))');
        assertEquals(block.receipts[1].result, '(ok (some {mime-type: "video/webm", name: "Clarity Developer OG", uri: "https://assets.website-files.com/5fcf9ac604d37418aa70a5ab/6040d72dcd78ad8f04db36cf_gradioooo-ps-transcode.webm"}))');
        assertEquals(block.receipts[2].result, '(ok (some {mime-type: "video/webm", name: "swag", uri: "https://assets.website-files.com/5fcf9ac604d37418aa70a5ab/6040d72dcd78ad8f04db36cf_gradioooo-ps-transcode.webm"}))');
    },
});

Clarinet.test({
    name: "Transfer between accounts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;
        let wallet_5 = accounts.get("wallet_5")!;
        let wallet_6 = accounts.get("wallet_6")!;
        let block = chain.mineBlock([
            // mint
            Tx.contractCall("swag-1000-nft", "claim-swag", [], wallet_1.address),
            // wrong sender
            Tx.contractCall("swag-1000-nft", "transfer", [types.uint(1), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], wallet_5.address),
            // account does not own token
            Tx.contractCall("swag-1000-nft", "transfer", [types.uint(2), types.principal('ST398MYTA19HSZFCFXWSB9VYAXYJXED4Z9QFKWG4W'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], wallet_1.address),
            // sender equals recipient
            Tx.contractCall("swag-1000-nft", "transfer", [types.uint(1), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH')], wallet_1.address),
            // success
            Tx.contractCall("swag-1000-nft", "transfer", [types.uint(1), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], wallet_1.address),
            // verify owner change
            Tx.contractCall("swag-1000-nft", "get-owner", [types.uint(1)], wallet_6.address),
            // token id does not exist
            Tx.contractCall("swag-1000-nft", "transfer", [types.uint(5), types.principal('ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH'), types.principal('ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40')], wallet_1.address),
        ]);
        assertEquals(block.receipts.length, 7);
        assertEquals(block.receipts[1].result, "(err u401)");
        assertEquals(block.receipts[2].result, "(err u401)");
        assertEquals(block.receipts[3].result, '(err u401)');
        // assertEquals(block.receipts[4].result, '(ok true)');
        // assertEquals(block.receipts[5].result, '(ok (some ST3AA33M8SS15A30ETXE134ZXD8TNEDHT8Q955G40))');
        // assertEquals(block.receipts[6].result, '(err u404)');
    },
});