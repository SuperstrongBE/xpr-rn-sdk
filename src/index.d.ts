/**
 * Proton Link v4.2.18
 * https://github.com/protonprotocol/proton-link
 *
 * @license
 * Copyright (c) 2020 Greymass Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  1. Redistribution of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *
 *  2. Redistribution in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder nor the names of its contributors
 *     may be used to endorse or promote products derived from this software without
 *     specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * YOU ACKNOWLEDGE THAT THIS SOFTWARE IS NOT DESIGNED, LICENSED OR INTENDED FOR USE
 * IN THE DESIGN, CONSTRUCTION, OPERATION OR MAINTENANCE OF ANY MILITARY FACILITY.
 */
import {
  Name,
  PublicKey,
  PermissionLevel,
  NameType,
  PermissionLevelType,
  PublicKeyType,
  PrivateKeyType,
  Bytes,
  AnyTransaction,
  AnyAction,
  Signature,
  Transaction,
  ABIDef,
  ABISerializable,
  Struct,
  UInt64,
  UInt32,
  TimePointSec,
} from '@greymass/eosio';
export * from '@greymass/eosio';
import {
  ChainId,
  ChainIdType,
  SigningRequest,
  CallbackPayload,
  SigningRequestEncodingOptions,
  ResolvedSigningRequest,
  ResolvedTransaction,
  IdentityProof,
  AbiProvider,
  SigningRequestCreateArguments,
} from '@proton/signing-request';
export * from '@proton/signing-request';
export {
  CallbackPayload,
  ChainId,
  ChainIdType,
  ChainName,
  IdentityProof,
  IdentityProofType,
} from '@proton/signing-request';
import * as _proton_js from '@proton/js';
import { JsonRpc, RpcInterfaces } from '@proton/js';

/**
 * Interface storage adapters should implement.
 *
 * Storage adapters are responsible for persisting [[LinkSession]]s and can optionally be
 * passed to the [[Link]] constructor to auto-persist sessions.
 */
interface LinkStorage {
  /** Write string to storage at key. Should overwrite existing values without error. */
  write(key: string, data: string): Promise<void>;
  /** Read key from storage. Should return `null` if key can not be found. */
  read(key: string): Promise<string | null>;
  /** Delete key from storage. Should not error if deleting non-existing key. */
  remove(key: string): Promise<void>;
}

/**
 * Type describing a link session that can create a eosjs compatible
 * signature provider and transact for a specific auth.
 */
declare abstract class LinkSession {
  /** @internal */
  constructor();
  /** The underlying link instance used by the session. */
  abstract link: Link;
  /** App identifier that owns the session. */
  abstract identifier: Name;
  /** Id of the chain where the session is valid. */
  abstract chainId: ChainId;
  /** The public key the session can sign for. */
  abstract publicKey: PublicKey;
  /** The EOSIO auth (a.k.a. permission level) the session can sign for. */
  abstract auth: PermissionLevel;
  /** Session type, e.g. 'channel'.  */
  abstract type: string;
  /** Arbitrary metadata that will be serialized with the session. */
  abstract metadata: {
    [key: string]: any;
  };
  /** Creates a eosjs compatible signature provider that can sign for the session public key. */
  abstract makeSignatureProvider(): any;
  /**
   * Transact using this session. See [[Link.transact]].
   */
  abstract transact(
    args: TransactArgs,
    options?: TransactOptions
  ): Promise<TransactResult>;
  /** Returns a JSON-encodable object that can be used recreate the session. */
  abstract serialize(): SerializedLinkSession;
  /**
   * Convenience, remove this session from associated [[Link]] storage if set.
   * Equivalent to:
   * ```ts
   * session.link.removeSession(session.identifier, session.auth, session.chainId)
   * ```
   */
  remove(): Promise<void>;
  /** API client for the chain this session is valid on. */
  get client(): _proton_js.JsonRpc;
  /** Restore a previously serialized session. */
  static restore(link: Link, data: SerializedLinkSession): LinkSession;
}
/** @internal */
interface SerializedLinkSession {
  type: string;
  metadata: {
    [key: string]: any;
  };
  data: any;
}
/** @internal */
interface ChannelInfo {
  /** Public key requests are encrypted to. */
  key: PublicKeyType;
  /** The wallet given channel name, usually the device name. */
  name: string;
  /** The channel push url. */
  url: string;
}
/** @internal */
interface LinkChannelSessionData {
  /** App identifier that owns the session. */
  identifier: NameType;
  /** Authenticated user permission. */
  auth: PermissionLevelType;
  /** Public key of authenticated user */
  publicKey: PublicKeyType;
  /** The wallet channel url. */
  channel: ChannelInfo;
  /** The private request key. */
  requestKey: PrivateKeyType;
  /** The session chain id. */
  chainId: ChainIdType;
}
/**
 * Link session that pushes requests over a channel.
 * @internal
 */
declare class LinkChannelSession extends LinkSession implements LinkTransport {
  readonly link: Link;
  readonly chainId: ChainId;
  readonly auth: PermissionLevel;
  readonly identifier: Name;
  readonly type = 'channel';
  metadata: any;
  readonly publicKey: PublicKey;
  serialize: () => SerializedLinkSession;
  private timeout;
  private encrypt;
  private channelKey;
  private channelUrl;
  private channelName;
  constructor(link: Link, data: LinkChannelSessionData, metadata: any);
  onSuccess(request: any, result: any): void;
  onFailure(request: any, error: any): void;
  onRequest(request: SigningRequest, cancel: any): void;
  addLinkInfo(request: SigningRequest): void;
  prepare(request: any): Promise<any>;
  showLoading(): void;
  recoverError(error: Error, request: SigningRequest): boolean;
  makeSignatureProvider(): any;
  transact(
    args: TransactArgs,
    options?: TransactOptions
  ): Promise<TransactResult>;
}
/** @internal */
interface LinkFallbackSessionData {
  auth: PermissionLevelType;
  publicKey: PublicKeyType;
  identifier: NameType;
  chainId: ChainIdType;
}
/**
 * Link session that sends every request over the transport.
 * @internal
 */
declare class LinkFallbackSession extends LinkSession implements LinkTransport {
  readonly link: Link;
  readonly chainId: ChainId;
  readonly auth: PermissionLevel;
  readonly type = 'fallback';
  readonly identifier: Name;
  readonly metadata: {
    [key: string]: any;
  };
  readonly publicKey: PublicKey;
  serialize: () => SerializedLinkSession;
  constructor(link: Link, data: LinkFallbackSessionData, metadata: any);
  onSuccess(request: any, result: any): void;
  onFailure(request: any, error: any): void;
  onRequest(request: any, cancel: any): void;
  prepare(request: any): Promise<any>;
  showLoading(): void;
  makeSignatureProvider(): any;
  transact(
    args: TransactArgs,
    options?: TransactOptions
  ): Promise<TransactResult>;
}

/**
 * Protocol link transports need to implement.
 *
 * A transport is responsible for getting the request to the
 * user, e.g. by opening request URIs or displaying QR codes.
 */
interface LinkTransport {
  /**
   * Present a signing request to the user.
   * @param request The signing request.
   * @param cancel Can be called to abort the request.
   */
  onRequest(
    request: SigningRequest,
    cancel: (reason: string | Error) => void
  ): void;
  /** Called if the request was successful. */
  onSuccess?(request: SigningRequest, result: TransactResult): void;
  /** Called if the request failed. */
  onFailure?(request: SigningRequest, error: Error): void;
  /**
   * Called when a session request is initiated.
   * @param session Session where the request originated.
   * @param request Signing request that will be sent over the session.
   */
  onSessionRequest?(
    session: LinkSession,
    request: SigningRequest,
    cancel: (reason: string | Error) => void
  ): void;
  /** Can be implemented if transport provides a storage as well. */
  storage?: LinkStorage;
  /** Can be implemented to modify request just after it has been created. */
  prepare?(
    request: SigningRequest,
    session?: LinkSession
  ): Promise<SigningRequest>;
  /** Called immediately when the transaction starts */
  showLoading?(): void;
  /** User agent reported to the signer. */
  userAgent?(): string;
  /** Send session request payload, optional. Can return false to indicate it has to be sent over the socket. */
  sendSessionPayload?(payload: Bytes, session: LinkSession): boolean;
  /**
   * Can be implemented to recover from certain errors, if the function returns true the error will
   * not bubble up to the caller of .transact or .login and the link will continue waiting for the callback.
   */
  recoverError?(error: Error, request: SigningRequest): boolean;
}

/** Service that handles waiting for a ESR callback to be sent to an url. */
interface LinkCallbackService {
  create(): LinkCallback;
}
/** Can be returned by callback services if the user explicitly rejects the request. */
interface LinkCallbackRejection {
  /** Rejection message. */
  rejected: string;
}
/** Callback response, can either be a ESR callback payload or a rejection message. */
declare type LinkCallbackResponse = CallbackPayload | LinkCallbackRejection;
/** Callback that can be waited for. */
interface LinkCallback {
  /** Url that should be hit to trigger the callback. */
  url: string;
  /** Wait for the callback to resolve. */
  wait(): Promise<LinkCallbackResponse>;
  /** Cancel a pending callback. */
  cancel(): void;
}

/**
 * Type describing a EOSIO chain.
 */
interface LinkChainConfig {
  /**
   * The chains unique 32-byte id.
   */
  chainId: ChainIdType;
  /**
   * URL to EOSIO node to communicate with (or a @greymass/eosio APIClient instance).
   */
  nodeUrl: string | JsonRpc;
}
/**
 * Available options when creating a new [[Link]] instance.
 */
export interface LinkOptions {
  /**
   * Link transport responsible for presenting signing requests to user.
   */
  transport: LinkTransport;
  /**
   * Chain configurations to support.
   * For example for a link that can login and transact on EOS and WAX:
   * ```ts
   * [
   *     {
   *         chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
   *         nodeUrl: 'https://eos.greymass.com',
   *     },
   *     {
   *         chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
   *         nodeUrl: 'https://wax.greymass.com',
   *     },
   * ]
   * ```
   */
  chains: LinkChainConfig[];
  /**
   * ChainID or esr chain name alias for which the link is valid.
   * @deprecated Use [[chains]] instead.
   */
  chainId?: ChainIdType;
  /**
   * URL to EOSIO node to communicate with or a `@greymass/eosio` APIClient instance.
   * @deprecated Use [[chains]] instead.
   */
  client?: string | JsonRpc;
  /**
   * URL to callback forwarder service or an object implementing [[LinkCallbackService]].
   * See [buoy-nodejs](https://github.com/greymass/buoy-nodejs) and (buoy-golang)[https://github.com/greymass/buoy-golang]
   * for reference implementations.
   * @default `https://cb.anchor.link`
   */
  service?: string | LinkCallbackService;
  /**
   * Optional storage adapter that will be used to persist sessions. If not set will use the transport storage
   * if available, explicitly set this to `null` to force no storage.
   * @default Use transport storage.
   */
  storage?: LinkStorage | null;
  /**
   * Whether to verify identity proofs submitted by the signer, if this is disabled the
   * [[Link.login | login]] and [[Link.identify | identify]] methods will not return an account object.
   * @default `false`
   */
  verifyProofs?: boolean;
  /**
   * Whether to encode the chain ids with the identity request that establishes a session.
   * Only applicable when using multiple chain configurations, can be set to false to
   * decrease QR code sizes when supporting many chains.
   * @default `true`
   */
  encodeChainIds?: boolean;
  /**
   * Scheme for transport
   */
  scheme: SigningRequestEncodingOptions['scheme'];
  /**
   * Type of wallet (Anchor/Proton)
   */
  walletType?: string;
}
/** @internal */
declare namespace LinkOptions {
  /** @internal */
  const defaults: {
    service: string;
    verifyProofs: boolean;
    encodeChainIds: boolean;
  };
}

/**
 * Payload accepted by the [[Link.transact]] method.
 * Note that one of `action`, `actions` or `transaction` must be set.
 */
interface TransactArgs {
  /** Full transaction to sign. */
  transaction?: AnyTransaction;
  /** Action to sign. */
  action?: AnyAction;
  /** Actions to sign. */
  actions?: AnyAction[];
}
/**
 * Options for the [[Link.transact]] method.
 */
interface TransactOptions {
  /**
   * Whether to broadcast the transaction or just return the signature.
   * Defaults to true.
   */
  broadcast?: boolean;
  /**
   * Chain to use when configured with multiple chains.
   */
  chain?: LinkChainType;
  /**
   * Whether the signer can make modifications to the request
   * (e.g. applying a cosigner action to pay for resources).
   *
   * Defaults to false if [[broadcast]] is true or unspecified; otherwise true.
   */
  noModify?: boolean;
}
/**
 * The result of a [[Link.transact]] call.
 */
interface TransactResult {
  /** The resolved signing request. */
  resolved: ResolvedSigningRequest;
  /** The chain that was used. */
  chain: LinkChain;
  /** The transaction signatures. */
  signatures: Signature[];
  /** The callback payload. */
  payload: CallbackPayload;
  /** The signer authority. */
  signer: PermissionLevel;
  /** The resulting transaction. */
  transaction: Transaction;
  /** Resolved version of transaction, with the action data decoded. */
  resolvedTransaction: ResolvedTransaction;
  /** Push transaction response from api node, only present if transaction was broadcast. */
  processed?: {
    [key: string]: any;
  };
}
/**
 * The result of a [[Link.identify]] call.
 */
interface IdentifyResult extends TransactResult {
  /** The identified account, not present unless [[LinkOptions.verifyProofs]] is set to true. */
  account?: RpcInterfaces.GetAccountResult;
  /** The identity proof. */
  proof: IdentityProof;
}
/**
 * The result of a [[Link.login]] call.
 */
interface LoginResult extends IdentifyResult {
  /** The session created by the login. */
  session: LinkSession;
}
/**
 * Link chain, can be a [[LinkChain]] instance, a chain id or a index in [[Link.chains]].
 * @internal
 */
declare type LinkChainType = LinkChain | ChainIdType | number;
/**
 * Class representing a EOSIO chain.
 */
declare class LinkChain implements AbiProvider {
  /** EOSIO ChainID for which requests are valid. */
  chainId: ChainId;
  /** API client instance used to communicate with the chain. */
  client: JsonRpc;
  private abiCache;
  private pendingAbis;
  /** @internal */
  constructor(chainId: ChainIdType, clientOrUrl: JsonRpc | string);
  /**
   * Fetch the ABI for given account, cached.
   * @internal
   */
  getAbi(account: Name): Promise<ABIDef>;
}
/**
 * Proton Link main class.
 *
 * @example
 *
 * ```ts
 * import ProtonLink from 'proton-link'
 * import ConsoleTransport from 'proton-console-transport'
 *
 * const link = new ProtonLink({
 *     transport: new ConsoleTransport(),
 *     chains: [
 *         {
 *             chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
 *             nodeUrl: 'https://eos.greymass.com',
 *         },
 *     ],
 * })
 *
 * const result = await link.transact({actions: myActions})
 * ```
 */
declare class Link {
  /** Package version. */
  static version: string;
  /** Chains this instance is configured with. */
  readonly chains: LinkChain[];
  /** Transport used to deliver requests to the users wallet. */
  readonly transport: LinkTransport;
  /** Storage adapter used to persist sessions. */
  readonly storage?: LinkStorage;
  /** Scheme of request */
  readonly scheme: SigningRequestEncodingOptions['scheme'];
  /** Scheme of request */
  readonly walletType?: string;
  private callbackService;
  private verifyProofs;
  private encodeChainIds;
  /** Create a new link instance. */
  constructor(options: LinkOptions);
  /**
   * The APIClient instance for communicating with the node.
   * @note This returns the first APIClient when link is configured with multiple chains.
   */
  get client(): JsonRpc;
  /**
   * Return a [[LinkChain]] object for given chainId or chain reference.
   * @throws If this link instance has no configured chain for given reference.
   * @internal
   */
  getChain(chain: LinkChainType): LinkChain;
  /**
   * Create a SigningRequest instance configured for this link.
   * @internal
   */
  createRequest(
    args: SigningRequestCreateArguments,
    chain?: LinkChain,
    transport?: LinkTransport
  ): Promise<{
    request: SigningRequest;
    callback: LinkCallback;
  }>;
  /**
   * Send a SigningRequest instance using this link.
   * @internal
   */
  sendRequest(
    request: SigningRequest,
    callback: LinkCallback,
    chain?: LinkChain,
    transport?: LinkTransport,
    broadcast?: boolean
  ): Promise<TransactResult>;
  /**
   * Sign and optionally broadcast a EOSIO transaction, action or actions.
   *
   * Example:
   *
   * ```ts
   * let result = await myLink.transact({transaction: myTx})
   * ```
   *
   * @param args The action, actions or transaction to use.
   * @param options Options for this transact call.
   * @param transport Transport override, for internal use.
   */
  transact(
    args: TransactArgs,
    options?: TransactOptions,
    transport?: LinkTransport
  ): Promise<TransactResult>;
  /**
   * Send an identity request and verify the identity proof if [[LinkOptions.verifyProofs]] is true.
   * @param args.scope The scope of the identity request.
   * @param args.requestPermission Optional request permission if the request is for a specific account or permission.
   * @param args.info Metadata to add to the request.
   * @note This is for advanced use-cases, you probably want to use [[Link.login]] instead.
   */
  identify(args: {
    requestPermission?: PermissionLevelType;
    info?: {
      [key: string]: ABISerializable | Bytes;
    };
  }): Promise<IdentifyResult>;
  /**
   * Login and create a persistent session.
   * @param identifier The session identifier, an EOSIO name (`[a-z1-5]{1,12}`).
   *                   Should be set to the contract account if applicable.
   */
  login(identifier: NameType): Promise<LoginResult>;
  /**
   * Restore previous session, use [[login]] to create a new session.
   * @param identifier The session identifier, must be same as what was used when creating the session with [[login]].
   * @param auth A specific session auth to restore, if omitted the most recently used session will be restored.
   * @param chainId If given function will only consider that specific chain when restoring session.
   * @returns A [[LinkSession]] instance or null if no session can be found.
   * @throws If no [[LinkStorage]] adapter is configured or there was an error retrieving the session data.
   **/
  restoreSession(
    identifier: NameType,
    auth?: PermissionLevelType,
    chainId?: ChainIdType
  ): Promise<LinkSession | null>;
  /**
   * List stored session auths for given identifier.
   * The most recently used session is at the top (index 0).
   * @throws If no [[LinkStorage]] adapter is configured or there was an error retrieving the session list.
   **/
  listSessions(identifier: NameType): Promise<
    {
      auth: PermissionLevel;
      chainId: ChainId;
    }[]
  >;
  /**
   * Remove stored session for given identifier and auth.
   * @throws If no [[LinkStorage]] adapter is configured or there was an error removing the session data.
   */
  removeSession(
    identifier: NameType,
    auth: PermissionLevel,
    chainId: ChainId
  ): Promise<void>;
  /**
   * Remove all stored sessions for given identifier.
   * @throws If no [[LinkStorage]] adapter is configured or there was an error removing the session data.
   */
  clearSessions(identifier: string): Promise<void>;
  /**
   * Create an eosjs compatible signature provider using this link.
   * @param availableKeys Keys the created provider will claim to be able to sign for.
   * @param chain Chain to use when configured with multiple chains.
   * @param transport (internal) Transport override for this call.
   * @note We don't know what keys are available so those have to be provided,
   *       to avoid this use [[LinkSession.makeSignatureProvider]] instead. Sessions can be created with [[Link.login]].
   */
  makeSignatureProvider(
    availableKeys: string[],
    chain?: LinkChainType,
    transport?: LinkTransport
  ): any;
  /** Makes sure session is in storage list of sessions and moves it to top (most recently used). */
  private touchSession;
  /**
   * Makes sure session is in storage list of sessions and moves it to top (most recently used).
   * @internal
   */
  storeSession(session: LinkSession): Promise<void>;
  /** Session storage key for identifier and suffix. */
  private sessionKey;
  /**
   * Return user agent of this link.
   * @internal
   */
  getUserAgent(): string;
}

declare class SealedMessage extends Struct {
  from: PublicKey;
  nonce: UInt64;
  ciphertext: Bytes;
  checksum: UInt32;
}
declare class LinkCreate extends Struct {
  session_name: Name;
  request_key: PublicKey;
  user_agent?: string;
}
declare class LinkInfo extends Struct {
  expiration: TimePointSec;
}

/**
 * Error codes. Accessible using the `code` property on errors thrown by [[Link]] and [[LinkSession]].
 * - `E_DELIVERY`: Unable to route message to wallet.
 * - `E_TIMEOUT`: Request was delivered but user/wallet didn't respond in time.
 * - `E_CANCEL`: The [[LinkTransport]] canceled the request.
 * - `E_IDENTITY`: Identity proof failed to verify.
 */
declare type LinkErrorCode =
  | 'E_DELIVERY'
  | 'E_TIMEOUT'
  | 'E_CANCEL'
  | 'E_IDENTITY';
/**
 * Error that is thrown if a [[LinkTransport]] cancels a request.
 * @internal
 */
declare class CancelError extends Error {
  code: string;
  constructor(reason?: string);
}
/**
 * Error that is thrown if an identity request fails to verify.
 * @internal
 */
declare class IdentityError extends Error {
  code: string;
  constructor(reason?: string);
}
/**
 * Error originating from a [[LinkSession]].
 * @internal
 */
declare class SessionError extends Error {
  code: 'E_DELIVERY' | 'E_TIMEOUT';
  session: LinkSession;
  constructor(
    reason: string,
    code: 'E_DELIVERY' | 'E_TIMEOUT',
    session: LinkSession
  );
}

export {
  CancelError,
  IdentifyResult,
  IdentityError,
  Link,
  LinkCallback,
  LinkCallbackRejection,
  LinkCallbackResponse,
  LinkCallbackService,
  LinkChain,
  LinkChainConfig,
  LinkChainType,
  LinkChannelSession,
  LinkChannelSessionData,
  LinkCreate,
  LinkErrorCode,
  LinkFallbackSession,
  LinkFallbackSessionData,
  LinkInfo,
  LinkOptions,
  LinkSession,
  LinkStorage,
  LinkTransport,
  LoginResult,
  SealedMessage,
  SerializedLinkSession,
  SessionError,
  TransactArgs,
  TransactOptions,
  TransactResult,
  Link as default,
};
