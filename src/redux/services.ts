import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@env';

export const apiClient = createApi({
  reducerPath: 'apiClient',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: async (headers, { endpoint, arg }) => {
      let token;
      let requestUrl = '';

      if (arg && typeof arg === 'object' && 'url' in arg) {
        requestUrl = arg.url;
      }

      if (typeof arg === 'string') {
        requestUrl = arg;
      }
      // const requestUrl = arg?.url ?? endpoint ?? '';
      console.log('requestUrl : ', requestUrl);
      console.log('arg : ', arg);
      if (requestUrl?.includes('mobile')) {
        token = await AsyncStorage.getItem('@token');
        console.log('token mobile : ', token);
      } else {
        if (!requestUrl.includes('verification')) {
          token = await AsyncStorage.getItem('webtoken');
          console.log('token web : ', token);
        }
      }

      // const token = await AsyncStorage.getItem('@token');
      // const web_token = await AsyncStorage.getItem('@web_token');

      if (token && token !== undefined) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Accept', `*/*`);
      }
      return headers;
    },
  }),
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: builder => ({
    register: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-auth/register', // your upload endpoint
        method: 'POST',
        body: request,
      }),
    }),
    loginUser: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-auth/login', // your upload endpoint
        method: 'POST',
        body: request,
      }),
    }),
    verificationUser: builder.query({
      query: ({ name, passportNo, uidNo }) =>
        `website/verification?name=${name}&passportNo=${passportNo}&uidNo=${uidNo}`,
    }),
    countries: builder.query({
      query: () => `website/countries`,
    }),
    get_profile: builder.query({
      query: () => `/mobile-data/profile`,
    }),
    get_claims: builder.query({
      query: ({ category }) => `mobile-data/claims?filter=${category}`,
    }),
    claim_category: builder.query({
      query: () => `website/claim-categories`,
    }),
    get_policy: builder.query({
      query: ({ category }) => `mobile-data/policies?filter=${category}`,
    }),
    trusted_hospitals: builder.query({
      query: ({ category }) =>
        `mobile-data/trusted-hospitals?search=${category}`,
    }),
    emergency_contacts: builder.query({
      query: () => `mobile-data/emergency-contacts`,
    }),
    claim_form_submit: builder.query({
      query: ({ id }) => `website/claim-form-submit/?claimCategoryIds=${id}`,
    }),
    claim_categories_documents: builder.query({
      query: ({ id, country }) =>
        `website/claim-categories/documents/${id}?country=${country}`,
    }),
    user_meta: builder.query({
      query: () => `website/claim-request/user/meta`,
    }),
    request_review: builder.query({
      query: ({ id }) => `website/claim-request/review/${id}`,
    }),
    user: builder.query({
      query: () => `website/claim-request/user`,
    }),
    singapore_banks: builder.query({
      query: () => `website/singapore-banks`,
    }),
    claim_request: builder.mutation({
      query: (formData: FormData) => ({
        url: '/website/claim-request',
        method: 'POST',
        body: formData,
      }),
    }),
    claim_request_put: builder.mutation({
      query: (formData: FormData) => ({
        url: '/website/claim-request',
        method: 'PUT',
        body: formData,
      }),
    }),
    upload_signature: builder.mutation({
      query: (formData: FormData) => ({
        url: '/mobile-data/upload-signature',
        method: 'POST',
        body: formData,
      }),
    }),
    upload_profile_picture: builder.mutation({
      query: (formData: FormData) => ({
        url: '/mobile-data/upload-profile-picture',
        method: 'POST',
        body: formData,
      }),
    }),
    submit_payment_details: builder.mutation({
      query: (request: any) => ({
        url: 'website/claim-request/payment',
        method: 'POST',
        body: request,
      }),
    }),
    submit_payment_details_edit: builder.mutation({
      query: ({ request, id }) => ({
        url: `website/claim-request/update/payment/${id}`,
        method: 'PUT',
        body: request,
      }),
    }),
    update_profile: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-data/update-profile',
        method: 'POST',
        body: request,
      }),
    }),
    claim_form_submit_final: builder.mutation({
      query: (request: any) => ({
        url: 'website/claim-form-submit',
        method: 'POST',
        body: request,
      }),
    }),
    claim_form_submit_final_edit: builder.mutation({
      query: ({ request, id }) => ({
        url: `website/claim-form-submit/${id}`,
        method: 'PUT',
        body: request,
      }),
    }),
    delete_doc: builder.mutation({
      query: (request: any) => ({
        url: `website/claim-request/delete-doc`,
        method: 'PUT',
        body: request,
      }),
    }),
    claim_request_submit: builder.mutation({
      query: (request: any) => ({
        url: 'website/claim-request/submit',
        method: 'POST',
        body: request,
      }),
    }),
    reset_password: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-data/change-password',
        method: 'POST',
        body: request,
      }),
    }),
    forgot_password: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-auth/forgot-password',
        method: 'POST',
        body: request,
      }),
    }),
    passportById: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-data/passport-by-uid',
        method: 'POST',
        body: request,
      }),
    }),
    apple_wallet_pass: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-data/apple-wallet-pass',
        method: 'POST',
        body: request,
      }),
    }),
    google_wallet_pass: builder.mutation({
      query: (request: any) => ({
        url: 'mobile-data/google-wallet-pass',
        method: 'POST',
        body: request,
      }),
    }),
    save_draft: builder.mutation({
      query: (formData: any) => ({
        url: 'website/claim-request/save-draft/',
        method: 'PUT',
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLazyGet_profileQuery,
  useRegisterMutation,
  useLazyGet_claimsQuery,
  useReset_passwordMutation,
  useUpload_signatureMutation,
  useLazyEmergency_contactsQuery,
  useLazyTrusted_hospitalsQuery,
  useDelete_docMutation,
  useUpload_profile_pictureMutation,
  useClaim_request_submitMutation,
  useClaim_request_putMutation,
  useSubmit_payment_detailsMutation,
  useSubmit_payment_details_editMutation,
  useForgot_passwordMutation,
  useApple_wallet_passMutation,
  useGoogle_wallet_passMutation,
  useLazySingapore_banksQuery,
  useLazyUser_metaQuery,
  useLazyRequest_reviewQuery,
  useLazyGet_policyQuery,
  useLazyUserQuery,
  useClaim_form_submit_final_editMutation,
  usePassportByIdMutation,
  useLazyClaim_categories_documentsQuery,
  useClaim_form_submit_finalMutation,
  useLazyClaim_form_submitQuery,
  useSave_draftMutation,
  useClaim_requestMutation,
  useLazyVerificationUserQuery,
  useLazyCountriesQuery,
  useLazyClaim_categoryQuery,
  useUpdate_profileMutation,
} = apiClient;
