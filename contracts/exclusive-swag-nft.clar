(impl-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.nft-trait.nft-trait)
(define-non-fungible-token exclusive-swag-nft uint)

;; Limited to first 100 developers
(define-constant max-tokens u100)

;; Define the registrations map
(define-map swag-contract-registrations { registration: principal } { claimed: bool })

;; Error handling
(define-constant nft-max-reached (err u403)) ;; no more tokens availabale
(define-constant nft-claimed-err (err u400)) ;; nft already claimed
(define-constant nft-not-owned-err (err u401)) ;; unauthorized
(define-constant nft-not-found-err (err u404)) ;; not found
(define-constant nft-not-registered (err u405)) ;; not registered
(define-constant sender-equals-recipient-err (err u405)) ;; method not allowed

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
    nft-claimed-err
    (err code)))

;; Storage
(define-map tokens-count principal uint)
(define-data-var last-id uint u0)

;; Allow querying the registrations map
(define-read-only (get-registration (id principal))
  (ok (map-get? swag-contract-registrations { registration: id })))

;; Transfers tokens to a specified principal.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (if (and
        (is-eq tx-sender sender))
      (match (nft-transfer? exclusive-swag-nft token-id sender recipient)
        success (ok success)
        error (nft-transfer-err error))
      nft-not-owned-err))

;; Claim a new exclusive-swag-nft-nft token.
(define-public (claim-swag)
  (begin
    (asserts! (< (var-get last-id) max-tokens) nft-max-reached)
    (asserts! (is-eq (balance-of tx-sender) u0) nft-claimed-err)
    (asserts! (is-eq (unwrap! (map-get? swag-contract-registrations { registration: tx-sender }) nft-not-found-err) { claimed: false }) nft-claimed-err)
    (mint tx-sender)))

;; Gets the owner of the specified token ID.
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? exclusive-swag-nft token-id)))

;; Gets the last token ID.
(define-read-only (get-last-token-id)
  (ok (var-get last-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some "https://docs.stacks.co/")))

(define-read-only (get-meta (token-id uint))
  (ok (some {name: "Clarity NFT OG", uri: "https://bafybeiaot5ym7z55hufdqvixp7hyuw54hur4xgkk45ps37wv2ibz2ijdby.ipfs.dweb.link/", mime-type: "video/webm"})))

(define-read-only (get-nft-meta)
  (ok (some {name: "Clarity NFT OG", uri: "https://bafybeiaot5ym7z55hufdqvixp7hyuw54hur4xgkk45ps37wv2ibz2ijdby.ipfs.dweb.link/", mime-type: "video/webm"})))

;; Register new contract deployment
(define-public (register-contract)
  (ok (map-insert swag-contract-registrations { registration: tx-sender } { claimed: false })))

;; Internal - Gets the amount of tokens owned by the specified address.
(define-private (balance-of (account principal))
  (default-to u0 (map-get? tokens-count account)))

;; Internal - Register token
(define-private (mint (new-owner principal))
    (let ((current-balance (balance-of new-owner)) (next-id (+ u1 (var-get last-id))))
      (match (nft-mint? exclusive-swag-nft next-id new-owner)
        success
          (begin
            (map-set tokens-count
              new-owner
              (+ u1 current-balance))
            (var-set last-id next-id)
            (ok success))
        error (nft-mint-err error))))