import axios from "axios"

export const registration = {
    state: () => ({
        meters: [],
        isMetersLoading: false,
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
        serverModuleName: 'meter-registration'
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
        setLoading(state, bool) {
            state.isMetersLoading = bool
        },
        setTypes(state, types) {
            state.types = types
        },
    },
    actions: {
        async fetchMeters({ state, commit }, inPyramid) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + `/api/${ this.state.registration.serverModuleName }/meters`,
                    { inPyramid: inPyramid },
                    { headers: { 'authorization': $cookies.get('auth_token') } })
                
                commit('setMeters', response.data)
                return response.data
            } finally {
                commit('setLoading', false)
            }
        },
    
        async fetchTypes({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.registration.serverModuleName }/meter-types`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            const meterTypes = response.data.map((type) => ({ value: type.id, text: type.type_name }))
            commit('setTypes', meterTypes)
        },
    
        async addMeter({ state, commit }, { serial_number, type, phase, icc, port, address, contact, ip_address, parent_id, gateway }) {
            try {
                commit('setLoading', true)
                
                const response = await axios.post(
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/meter`,
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
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/meters/` + id,
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
            } finally {
                commit('setLoading', false)
            }
        },

        async editMeter({state, commit}, { id, serial_number, type, phase, icc, index, port, address, contact, ip_address, parent_id, gateway }) {
            try {
                commit('setLoading', true)
                
                const response = await axios.put(
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/meters/` + id,
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

                return { data: response.data[0], index: index }
            } finally {
                commit('setLoading', false);
            }
        },

        async actualizeMeterDataFromRTC({ state, commit }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/actualize-data-from-rtc`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
            } finally {
                commit('setLoading', false);
            }
        },

        async updateMeterDataFromRTC({ state, commit }, { id, phone, status, type }) {
            const response = await axios.put(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/update-meter-from-rtc/` + id,
                { phone, status, type },
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return { data: response.data[0] }
        },

        async registerMeterBySms({ state, commit }, { id, serial_number, phone, phase, type }) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/send-sms/` + id,
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
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/check-sms/` + id,
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

        async actualizeMetersDataFromStek({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/actualize-data-from-stek/`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    
        async actualizeMeterDataFromStek({state, commit}, { id }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/actualize-data-from-stek/` + id,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },

        async updateMeterDataFromStek({ state, commit }, { id, personal_account, customer, customer_address, customer_phone, customer_email, customer_type, kftt }) {
            const response = await axios.put(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/update-meter-from-stek/` + id,
                {
                    personal_account,
                    customer,
                    customer_address,
                    customer_phone,
                    customer_email,
                    customer_type,
                    kftt
                },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            //построчное получение данных
            return { data: response.data[0] }
        },

        async saveSettings({ state, commit }, columns) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + '/api/save-settings',
                    {
                        module: 'meter_registration',
                        settings: 'columns',
                        value: columns.toString()
                    },
                    { headers: { 'authorization': $cookies.get('auth_token') }})

                return response.data
            } finally {
                commit('setLoading', false);
            }
        },

        async updateMeterAfterLoadInPyramid({ state, commit }, meterArray) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/save-meter-after-load-in-stek`,
                { meterArray: meterArray },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },

        async markMeter({ state, commit }, { meter, reason, comment }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/mark-meter/${meter.id}`,
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
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/broken-meters`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
                           } finally {
                commit('setLoading', false)
            }
        },

        async getNonActiveInPyramidMeters({ state, commit }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/get-non-active-meters-from-pyramid`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                return response.data
            } finally {
                commit('setLoading', false)
            }
        },

        async refreshMetersDataFromStek({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/refresh-data-from-stek/`,
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },

        async saveRefreshedMeterDataFromStek({ state, commit }, { id, data, personal_account, customer, customer_address, customer_phone, customer_email, customer_type, kftt}) {
            const response = await axios.put(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/save-refresh-meter-data-from-stek/` + id,
                {
                    personal_account,
                    customer,
                    customer_address,
                    customer_phone,
                    customer_email,
                    customer_type,
                    kftt,
                    data: JSON.stringify(data)
                },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            //построчное получение данных
            return { data: response.data[0] }
        },

        async removeMeterPyramidLoadValue({ state, commit }, meter) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/remove-meter-pyramid-load-value`,
                { meter },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data[0]
        },

        async addMeterPyramidLoadValue({ state, commit }, meter) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/add-meter-pyramid-load-value`,
                { meter },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data[0]
        },
    
        async getParentMirC04Meters({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/get-parent-mirc04-meters`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    },
    namespaced: true
}
