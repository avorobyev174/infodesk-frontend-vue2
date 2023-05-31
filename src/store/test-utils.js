import axios from "axios";

export const testUtils = {
    state: () => ({
        serverModuleName: 'test-utils'
    }),
    actions: {
        async getDataBySerialNumber({state, commit}, metersArr) {
            const response = await axios.post(
                this.state.serverUrl + `/api/test-utils/get-meter-test-data`,
                { metersArr },
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
        
        async goTest({state, commit}) {
            
            const response = await axios.get(
                this.state.serverUrl + `/api/test-utils/get-meter-test-connect`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
    
            console.log(response.data)
            return response.data
        },
    
        async goTest1({state, commit}) {
        
            const response = await axios.get(
                this.state.serverUrl + `/api/test-utils/get-meter-test-connect1`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            console.log(response.data)
            return response.data
        },
    
        async goTest2({state, commit}) {
            console.log('test2')
            const response = await axios.get(
                this.state.serverUrl + `/api/test-utils/get-meter-test-connect4`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            console.log(response.data)
            return response.data
        },
        
      /*  async getLoadedPyramidCountByAddress({state, commit}, metersArr) {
            const response = await axios.get(
                this.state.serverUrl + `/api/test-utils/get-meter-loaded-count-by-address`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
        async getMeterFromRepairToStorageCount({state, commit}, metersArr) {
            const response = await axios.get(
                this.state.serverUrl + `/api/test-utils/get-meter-from-repair-to-storage-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
        async getDataByNotInPyramid({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/test-utils/get-meter-not-loaded-in-pyramid`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },*/
    },
    namespaced: true
}
