import axios, {get, post} from "axios"

export const programming = {
    state: () => ({
        meters: [],
        loading: false,
        phases: [
            { text: '1-ф', value: 1 },
            { text: '3-ф', value: 3 },
        ],
        types: [],
        status: [
            { text: 'Отсутствует', value: 1 },
            { text: 'Действующий', value: 2 },
            { text: 'Заблокировано', value: 3 },
        ],
        ipAddress: [
            { text: '172.27.2.214', value: 1 },
            { text: '172.27.30.11', value: 2 },
            { text: '172.27.32.23', value: 3 },
            { text: '172.27.2.210', value: 4 },
        ],
        smsStatus: [
            { title: 'Не доступно', value: 0, color: 'black lighten-1', message: 'Пока отправка смс для счетчика не доступна'},
            { title: 'В ожидании отправки', value: 1, color: 'grey lighten-1', message: 'Отправить смс'},
            { title: 'В очереди', value: 2, color: 'orange lighten-1', message: 'Обновите статус'},
            { title: 'Доставлено', value: 3, color: 'green lighten-1', message: 'Смс уже успешно доставлена'},
            { title: 'Не доставлено', value: 4, color: 'red lighten-1', message: 'Смс не доставлена'},
            { title: 'Передано оператору', value: 5, color: 'orange lighten-1', message: 'Смс не доставлена'},
            { title: 'Таймаут 20мин', value: 6, color: 'red lighten-1', message: 'Смс не доставлена'},
            { title: 'Не требуется', value: 7, color: 'green lighten-1', message: 'Не требуется'},
            { title: 'В ожидании подтверждения', value: 8, color: 'orange lighten-1', message: 'Обновите статус'},
        ],
        serverModule: 'meter-registration'
    }),
    getters: {
        getMeters(state) {
            return state.meters
        },
        getPhases(state) {
            return state.phases
        },
        getTypes(state) {
            return state.types
        },
        getStatus(state) {
            return state.status
        },
        getSmsStatus(state) {
            return state.smsStatus
        },
        getIpAddress(state) {
            return state.ipAddress
        },
    },
    mutations: {
        setMeters(state, meters) {
            state.meters = meters
        },
        setLoading(state, loading) {
            state.loading = loading
        },
        setTypes(state, types) {
            state.types = types
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
    
        async addMeter({ state, commit }, { serial_number, type, phase, icc, port, address, contact, ip_address, parent_id, gateway }) {
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
                        gateway
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

        async editMeter({ state, commit }, { id, serial_number, type, phase, icc, port, address, contact, ip_address, parent_id, gateway }) {
            try {
                commit('setLoading', true)
                
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
                        gateway
                    },
                    { headers: { 'authorization': $cookies.get('auth_token') } })
                console.log(response.data)
                return response.data
            } finally {
                commit('setLoading', false)
            }
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

        async markMeterBroken({ state, commit }, { meter, reason, comment }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule }/mark-meter-broken/${ meter.id }`,
                {
                    data: JSON.stringify(meter),
                    comment: comment,
                    reason: reason
                },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },

        async fetchBrokenMeters({ state, commit }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(
                    this.state.serverUrl + `/api/${ state.serverModule }/broken-meters`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
                           } finally {
                commit('setLoading', false)
            }
        },
      
        async addOrRemovePyramidLoad({ state, commit }, { meters, isAdd }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule }/add-or-remove-meter-pyramid-value`,
                { meters, isAdd },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },
       
        async getParentMirC04Meters({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-parent-mirc04-meters`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    },
    namespaced: true
}
