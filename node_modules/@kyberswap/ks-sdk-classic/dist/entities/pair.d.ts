import { Token, Price, TokenAmount, BigintIsh, ChainId } from '@kyberswap/ks-sdk-core';
import JSBI from 'jsbi';
export declare class Pair {
    readonly liquidityToken: Token;
    private readonly tokenAmounts;
    private readonly virtualTokenAmounts;
    readonly fee: JSBI;
    readonly address: string;
    readonly amp: JSBI;
    constructor(address: string, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount, virtualTokenAmountA: TokenAmount, virtualTokenAmountB: TokenAmount, fee: JSBI, amp: JSBI);
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token: Token): boolean;
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price(): Price<Token, Token>;
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price(): Price<Token, Token>;
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token: Token): Price<Token, Token>;
    priceOfReal(token: Token): Price<Token, Token>;
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId(): ChainId;
    get token0(): Token;
    get token1(): Token;
    get reserve0(): TokenAmount;
    get reserve1(): TokenAmount;
    get virtualReserve0(): TokenAmount;
    get virtualReserve1(): TokenAmount;
    reserveOf(token: Token): TokenAmount;
    virtualReserveOf(token: Token): TokenAmount;
    getOutputAmount(inputAmount: TokenAmount): [TokenAmount, TokenAmount[]];
    getInputAmount(outputAmount: TokenAmount): [TokenAmount, TokenAmount[]];
    getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount;
    getLiquidityValue(token: Token, totalSupply: TokenAmount, liquidity: TokenAmount, feeBps?: JSBI, kLast?: BigintIsh): TokenAmount;
}
