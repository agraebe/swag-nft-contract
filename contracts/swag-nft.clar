(impl-trait 'ST000000000000000000002AMW42H.nft-trait.nft-trait)
(define-non-fungible-token swag uint)

;; Error handling
(define-constant nft-not-owned-err (err u401)) ;; unauthorized
(define-constant not-approved-spender-err (err u403)) ;; forbidden
(define-constant nft-not-found-err (err u404)) ;; not found
(define-constant sender-equals-recipient-err (err u405)) ;; method not allowed
(define-constant nft-exists-err (err u409)) ;; conflict

(define-map err-strings (response uint uint) (string-ascii 32))
(map-insert err-strings nft-not-owned-err "nft-not-owned")
(map-insert err-strings not-approved-spender-err "not-approaved-spender")
(map-insert err-strings nft-not-found-err "nft-not-found")
(map-insert err-strings nft-exists-err "nft-exists")

(define-private (nft-transfer-err (code uint))
  (if (is-eq u1 code)
    nft-not-owned-err
    (if (is-eq u2 code)
      sender-equals-recipient-err
      (if (is-eq u3 code)
        nft-not-found-err
        (err code)))))

(define-private (nft-mint-err (code uint))
  (if (is-eq u1 code)
    nft-exists-err
    (err code)))

(define-read-only (get-errstr (code uint))
  (unwrap! (map-get? err-strings (err code)) "unknown-error"))

;; Storage
(define-map tokens-spender
  uint
  principal)
(define-map tokens-count
  principal
  uint)
(define-map accounts-operator
  (tuple (operator principal) (account principal))
  (tuple (is-approved bool)))

;; Transfers tokens to a specified principal.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (if (and
        (is-eq tx-sender (unwrap! (nft-get-owner? swag token-id) nft-not-found-err))
        (is-eq tx-sender sender)
        (not (is-eq recipient sender)))
       (match (nft-transfer? swag token-id sender recipient)
        success (ok success)
        error (nft-transfer-err error))
      nft-not-owned-err))

;; Gets the owner of the specified token ID.
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? swag token-id)))

;; Gets the owner of the specified token ID.
(define-read-only (get-last-token-id)
  (ok u3))

(define-read-only (get-token-uri (token-id uint))
  (ok (some "ipfs://ipfs/QmPAg1mjxcEQPPtqsLoEcauVedaeMH81WXDPvPx3VC5zUz")))

(define-read-only (get-meta (token-id uint))
  (if (is-eq token-id u1)
    (ok (some {name: "EVERYDAYS: THE FIRST 5000 DAYS", uri: "https://ipfsgateway.makersplace.com/ipfs/QmZ15eQX8FPjfrtdX3QYbrhZxJpbLpvDpsgb2p3VEH8Bqq", mime-type: "image/jpeg"}))
    (ok none)))

(define-read-only (get-nft-meta)
  (ok (some {name: "swag", uri: "https://ipfsgateway.makersplace.com/ipfs/QmZ15eQX8FPjfrtdX3QYbrhZxJpbLpvDpsgb2p3VEH8Bqq", mime-type: "image/jpeg"})))

;; Internal - Gets the amount of tokens owned by the specified address.
(define-private (balance-of (account principal))
  (default-to u0 (map-get? tokens-count account)))

;; Internal - Register token
(define-private (mint (new-owner principal) (token-id uint))
    (let ((current-balance (balance-of new-owner)))
      (match (nft-mint? swag token-id new-owner)
        success
          (begin
            (map-set tokens-count
              new-owner
              (+ u1 current-balance))
            (ok success))
        error (nft-mint-err error))))

;; Initialize the contract
(begin
  (try! (mint 'ST238B5WSC8B8XETWDXMH7HZC2MJ2RNTYY15YY7SH u1))
  (try! (mint 'ST1P4WHXG566QVTAGXPFWPSMXKH0HEBY1S3VZ7PCA u2))
  (try! (mint 'ST2EGN8HCFSKEH0XKKG3FYQRE4RG0NYMD7NFZ8PP5 u3)))