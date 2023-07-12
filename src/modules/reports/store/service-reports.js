import axios from "axios"

export const serviceReports = {
    actions: {
        async getAssignmentEventsBySerialNumberReport({ rootState }, reqData) {
            return sendReqAndGetData(
                rootState,
                'post',
                'get-assignment-events-by-serial-number-report',
                reqData
            )
        },
        
        async getAssignmentEventsByCustomerAddressReport({ rootState }, reqData) {
            return sendReqAndGetData(
                rootState,
                'post',
                'get-assignment-events-by-customer-address-report',
                reqData
            )
        },
    
        async getAssignmentGroupByStatusReport({ rootState }, reqData) {
            return sendReqAndGetData(
                rootState,
                'post',
                'get-assignments-group-by-status-report',
                reqData
            )
        },
    
        async getAssignmentGroupByStatusAndOwnerReport({ rootState }, reqData) {
            return sendReqAndGetData(
                rootState,
                'post',
                'get-assignments-group-by-status-and-owner-report',
                reqData
            )
        },
        
        async getAssignmentEventsGroupByCloseReasonReport({ rootState }) {
            return sendReqAndGetData(
                rootState,
                'get',
                'get-assignment-events-group-by-close-reason-report'
            )
        },
    },
    namespaced: true,
}

async function sendReqAndGetData(state, reqType, url, data) {
    let response
    if (reqType === 'get') {
        response = await axios.get(
            state.serverUrl + `/api/${ state.reports.serverModuleName }/${ url }`,
            { headers: { 'authorization': $cookies.get('auth_token') } })
    } else {
        response = await axios[ reqType ](
            state.serverUrl + `/api/${ state.reports.serverModuleName }/${ url }`,
            { ...data },
            { headers: { 'authorization': $cookies.get('auth_token') } })
    }
    
    return response?.data
}
