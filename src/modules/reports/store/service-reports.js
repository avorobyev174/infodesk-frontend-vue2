import axios from "axios"

export const serviceReports = {
    actions: {
        async getAssignmentEventsBySerialNumberReport({ rootState }, reqData) {
            return sendReqAndGetData(rootState,'post','get-assignments-events-by-serial-number-report', reqData)
        },
    },
    namespaced: true,
}

async function sendReqAndGetData(state, reqType, url, data) {
    const response = await axios[ reqType ](
        state.serverUrl + `/api/${ state.reports.serverModuleName }/${ url }`,
        { ...data },
        { headers: { 'authorization': $cookies.get('auth_token') } })
    
    return response.data
}
