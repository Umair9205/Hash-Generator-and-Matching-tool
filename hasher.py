"""
Simple Hash Utility

Usage:
    python hasher.py -t "text" [-a sha256] [-o file]
    python hasher.py -m -t "text" -H "hash" [-o file]

Modes:
    - Generate Mode: Default (requires -t)
    - Match Mode: Use -m (requires -t and -H)
"""

import argparse
import hashlib
import sys

ALGORITHMS = {
    'md5': hashlib.md5,
    'sha1': hashlib.sha1,
    'sha224': hashlib.sha224,
    'sha256': hashlib.sha256,
    'sha384': hashlib.sha384,
    'sha512': hashlib.sha512,
    'blake2b': hashlib.blake2b,
    'blake2s': hashlib.blake2s,
}

def generate_hash(data: bytes, algorithm: str) -> str:
    h = ALGORITHMS[algorithm]()
    h.update(data)
    return h.hexdigest()

def main():
    parser = argparse.ArgumentParser(description="Simple Hash Utility", add_help=True)
    parser.add_argument('-t', '--text', type=str, required=True, help='Text to process')
    parser.add_argument('-a', '--algorithm', type=str, choices=ALGORITHMS.keys(), help='Hash algorithm')
    parser.add_argument('-H', '--hash', dest='hash_val', type=str, help='Hash value for matching mode')
    parser.add_argument('-m', '--match', action='store_true', help='Enable match mode')
    parser.add_argument('-o', '--output', type=str, help='Output file to save result')
    args = parser.parse_args()

    data = args.text.encode('utf-8')

    if args.match:
        if args.algorithm:
            print("Error: -a/--algorithm not allowed in match mode.")
            sys.exit(1)
        if not args.hash_val:
            print("Error: -H/--hash required in match mode.")
            sys.exit(1)
    else:
        if args.hash_val:
            print("Error: -H/--hash not allowed in normal mode.")
            sys.exit(1)

    if args.match:
        found = False
        for algo in ALGORITHMS:
            digest = generate_hash(data, algo)
            if digest.lower() == args.hash_val.lower():
                print(f"✅ Match found with {algo.upper()}")
                found = True
                result = f"Match found with {algo.upper()}"
                break
        if not found:
            print("❌ No match found.")
            result = "No match found."
    else:
        algorithm = args.algorithm or 'md5'
        digest = generate_hash(data, algorithm)
        print(f"Algorithm: {algorithm.upper()}\nHash: {digest}")
        result = f"{algorithm.upper()} : {digest}"

    if args.output:
        with open(args.output, 'w') as f:
            f.write(result + '\n')
        print(f"Saved result to {args.output}")

if __name__ == '__main__':
    main()

