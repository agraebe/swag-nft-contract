;; use the SIP090 interface
(impl-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.nft-trait.nft-trait)

;; define a new NFT. Make sure to replace MY-OWN-NFT
(define-non-fungible-token MY-OWN-NFT uint)

;; Store the last issues token ID
(define-data-var last-id uint u0)

;; Claim a new NFT
(define-public (claim)
  (mint tx-sender))

;; SIP090: Transfer token to a specified principal
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (if (and
        (is-eq tx-sender sender))
      ;; Make sure to replace MY-OWN-NFT
      (match (nft-transfer? MY-OWN-NFT token-id sender recipient)
        success (ok success)
        error (err error))
      (err u500)))

;; SIP090: Get the owner of the specified token ID
(define-read-only (get-owner (token-id uint))
  ;; Make sure to replace MY-OWN-NFT
  (ok (nft-get-owner? MY-OWN-NFT token-id)))

;; SIP090: Get the last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-id)))

;; SIP090: Get the token URI. You can set it to any other URI
(define-read-only (get-token-uri (token-id uint))
  (ok (some "https://docs.stacks.co")))

;; Internal - Mint new NFT
(define-private (mint (new-owner principal))
    (let ((next-id (+ u1 (var-get last-id))))
      ;; Make sure to replace MY-OWN-NFT
      (match (nft-mint? MY-OWN-NFT next-id new-owner)
        success
          (begin
            (var-set last-id next-id)
            ;; only make contract call when last-id is 0
            (if
              (is-eq next-id u1)
              (contract-call? 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.exclusive-swag-nft claim-swag)
              (ok true)))
        error (err error))))

;; Internal - Register for exclusive NFT eligiblity
(contract-call? 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.exclusive-swag-nft register-contract)