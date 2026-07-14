import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { HealthStatus, ListRequestsParams, Request, RequestInput, RequestStats, RequestStatusUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListRequestsUrl: (params?: ListRequestsParams) => string;
/**
 * @summary Barcha murojaatlarni olish
 */
export declare const listRequests: (params?: ListRequestsParams, options?: RequestInit) => Promise<Request[]>;
export declare const getListRequestsQueryKey: (params?: ListRequestsParams) => readonly ["/api/requests", ...ListRequestsParams[]];
export declare const getListRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listRequests>>, TError = ErrorType<unknown>>(params?: ListRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listRequests>>>;
export type ListRequestsQueryError = ErrorType<unknown>;
/**
 * @summary Barcha murojaatlarni olish
 */
export declare function useListRequests<TData = Awaited<ReturnType<typeof listRequests>>, TError = ErrorType<unknown>>(params?: ListRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRequestUrl: () => string;
/**
 * @summary Yangi murojaat yuborish va avtomatik turkumlash
 */
export declare const createRequest: (requestInput: RequestInput, options?: RequestInit) => Promise<Request>;
export declare const getCreateRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRequest>>, TError, {
        data: BodyType<RequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRequest>>, TError, {
    data: BodyType<RequestInput>;
}, TContext>;
export type CreateRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createRequest>>>;
export type CreateRequestMutationBody = BodyType<RequestInput>;
export type CreateRequestMutationError = ErrorType<unknown>;
/**
* @summary Yangi murojaat yuborish va avtomatik turkumlash
*/
export declare const useCreateRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRequest>>, TError, {
        data: BodyType<RequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRequest>>, TError, {
    data: BodyType<RequestInput>;
}, TContext>;
export declare const getGetRequestStatsUrl: () => string;
/**
 * @summary Dashboard statistikasi
 */
export declare const getRequestStats: (options?: RequestInit) => Promise<RequestStats>;
export declare const getGetRequestStatsQueryKey: () => readonly ["/api/requests/stats"];
export declare const getGetRequestStatsQueryOptions: <TData = Awaited<ReturnType<typeof getRequestStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequestStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRequestStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRequestStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getRequestStats>>>;
export type GetRequestStatsQueryError = ErrorType<unknown>;
/**
 * @summary Dashboard statistikasi
 */
export declare function useGetRequestStats<TData = Awaited<ReturnType<typeof getRequestStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequestStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRequestUrl: (id: number) => string;
/**
 * @summary Bitta murojaatni olish
 */
export declare const getRequest: (id: number, options?: RequestInit) => Promise<Request>;
export declare const getGetRequestQueryKey: (id: number) => readonly [`/api/requests/${number}`];
export declare const getGetRequestQueryOptions: <TData = Awaited<ReturnType<typeof getRequest>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequest>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRequest>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRequestQueryResult = NonNullable<Awaited<ReturnType<typeof getRequest>>>;
export type GetRequestQueryError = ErrorType<void>;
/**
 * @summary Bitta murojaatni olish
 */
export declare function useGetRequest<TData = Awaited<ReturnType<typeof getRequest>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequest>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateRequestStatusUrl: (id: number) => string;
/**
 * @summary Murojaat holatini yangilash
 */
export declare const updateRequestStatus: (id: number, requestStatusUpdate: RequestStatusUpdate, options?: RequestInit) => Promise<Request>;
export declare const getUpdateRequestStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRequestStatus>>, TError, {
        id: number;
        data: BodyType<RequestStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateRequestStatus>>, TError, {
    id: number;
    data: BodyType<RequestStatusUpdate>;
}, TContext>;
export type UpdateRequestStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateRequestStatus>>>;
export type UpdateRequestStatusMutationBody = BodyType<RequestStatusUpdate>;
export type UpdateRequestStatusMutationError = ErrorType<unknown>;
/**
* @summary Murojaat holatini yangilash
*/
export declare const useUpdateRequestStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRequestStatus>>, TError, {
        id: number;
        data: BodyType<RequestStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateRequestStatus>>, TError, {
    id: number;
    data: BodyType<RequestStatusUpdate>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map