import axios, { get, post } from "axios"

export const programming = {
    state: () => ({
        meters: [],
        loading: false,
        serverModule: 'meter-registration'
    }),
    getters: {
        getMeters(state) {
            return state.meters
        },
    },
    mutations: {
        setMeters(state, meters) {
            state.meters = meters
        },
        
        setLoading(state, loading) {
            state.loading = loading
        },
    },
    actions: {
        async fetchMeters({ state, commit }, options) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + `/api/${ state.serverModule }/meters`,
                    { options },
                    { headers: { 'authorization': $cookies.get('auth_token') } })
                
      
                const { meters, totalMetersCount } = response.data
                commit('setMeters', meters)
                return totalMetersCount
            } finally {
                commit('setLoading', false)
            }
        },
    
        async fetchAllMeters({ state, commit }, isCommit) {
            const response = await get(
                this.state.serverUrl + `/api/${ state.serverModule }/all-meters`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            const assignments = response.data
            if (isCommit) {
                commit('setAssignments', assignments)
            }
            return assignments
        },
    
        async metersFilter({ state, commit }, { filters, options }) {
            try {
                commit('setLoading', true)
                const response = await post(
                    this.state.serverUrl + `/api/${ state.serverModule }/filter`,
                    { filters, options },
                    { headers: { 'authorization': $cookies.get('auth_token') } })
                const { meters, totalMetersCount } = response.data
                commit('setMeters', meters)
                return totalMetersCount
            } finally {
                commit('setLoading', false)
            }
        },
    
        async fetchEvents({ state, commit }, id) {
            try {
                commit('setLoading', true)
                const response = await get(
                    this.state.serverUrl + `/api/${ state.serverModule }/logs/${ id }`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })
            
                return  response.data
            } finally {
                commit('setLoading', false)
            }
        },
    
        async addMeter({ state, commit }, { serial_number, type, phase, icc, port, address, contact, ip_address, parent_id, gateway, password }) {
            try {
                commit('setLoading', true)
                
                const response = await axios.post(
                    this.state.serverUrl + `/api/${ state.serverModule }/meter`,
                    {
                        serialNumber: serial_number,
                        type,
                        icc: String(icc), //из за большого числа 20 знаков
                        phase,
                        port,
                        address,
                        contact,
                        ipAddress: ip_address,
                        parentId: parent_id,
                        gateway,
                        password,
                    },
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
            } finally {
                commit('setLoading', false)
            }
        },

        async deleteMeter({ state, commit }, id) {
            try {
                commit('setLoading', true)
                const response = await axios.delete(
                    this.state.serverUrl + `/api/${ state.serverModule }/meters/${ id }`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
            } finally {
                commit('setLoading', false)
            }
        },

        async editMeter({ state }, { id, serial_number, type, phase, icc, port, address, contact, ip_address, parent_id, gateway, password }) {
            const response = await axios.put(
                this.state.serverUrl + `/api/${ state.serverModule }/meters/` + id,
                {
                    serialNumber: serial_number,
                    type: type,
                    icc:  String(icc), //из за большого числа 20 знаков
                    phase: phase,
                    port: port,
                    address: address,
                    contact: contact,
                    ipAddress: ip_address,
                    parentId: parent_id,
                    gateway,
                    password
                },
                { headers: { 'authorization': $cookies.get('auth_token') } })
          
            return response.data
        },
    
        async updateDataFromRTC({ state, commit }) {
            try {
                commit('setLoading', true)
                const response = await get(
                    this.state.serverUrl + `/api/${ state.serverModule }/update-data-from-rtc`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })
            
                return response.data
            } finally {
                commit('setLoading', false)
            }
        },

        async registerMeterBySms({ state, commit }, { id, serial_number, phone, phase, type }) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + `/api/${ state.serverModule }/send-sms/` + id,
                    {
                        phone,
                        serial_number,
                        phase,
                        type
                    },
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data[0]
            } finally {
                commit('setLoading', false)
            }
        },

        async checkMeterSmsStatus({ state, commit }, { id, sms_id, type, serial_number }) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + `/api/${ state.serverModule }/check-sms/` + id,
                    {
                        sms_id,
                        serial_number,
                        type
                    },
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data[0]
            } finally {
                commit('setLoading', false)
            }
        },

        async updateDataFromSTEK({ state, commit }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(
                    this.state.serverUrl + `/api/${ state.serverModule }/update-data-from-stek/`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })
                return response.data
            } finally {
                commit('setLoading', false)
            }
        },
    
        async updateSingleDataFromSTEK({ state, commit }, { id }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(
                    this.state.serverUrl + `/api/${ state.serverModule }/update-single-data-from-stek/` + id,
                    { headers: { 'authorization': $cookies.get('auth_token') } })
            
                return response.data
            } finally {
                commit('setLoading', false)
            }
        },
    
        async refreshMeterDataFromSTEK({ state, commit }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(
                    this.state.serverUrl + `/api/${ state.serverModule }/refresh-data-from-stek/`,
                    { headers: { 'authorization': $cookies.get('auth_token') }})
            
                return response.data
            } finally {
                commit('setLoading', false)
            }
        },
    
        async saveRefreshedMetersDataFromSTEK({ state, commit }, meters) {
            const response = await axios.put(
                this.state.serverUrl + `/api/${ state.serverModule }/save-refreshed-data-from-stek/`,
                { meters },
                { headers: { 'authorization': $cookies.get('auth_token') }})
        
            //построчное получение данных
            return response.data
        },
        
        async updateMeterLoad({ state, commit }, meters) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule }/update-meter-load`,
                { meters },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },

        async setMeterBroken({ state }, { meter, comment }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule }/set-meter-broken/${ meter.id }`,
                {
                    meter,
                    comment,
                },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },

        async fetchBrokenMeters({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-broken-meters`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    
        async fetchDeletedMeters({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-deleted-meters`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
      
        async addOrRemovePyramidLoad({ state, commit }, { meter, isAdd }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule }/add-or-remove-meter-pyramid-value`,
                { meter, isAdd },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },
       
        async getParentMirC04Meters({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-parent-mirc04-meters`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async removeSimCardData({ state, commit }, meter) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule }/remove-sim-data`,
                { meter },
                { headers: { 'authorization': $cookies.get('auth_token') }})
        
            return response.data
        },
    },
    namespaced: true
}
