import axios from "axios"

export const registration = {
    state: () => ({
        meters: [],
        isMetersLoading: false,
        phases: [
            { text: '1-ф', value: 1 },
            { text: '3-ф', value: 3 },
        ],
        types: [
            { text: 'Меркурий 204 ARTM-02 POBH.G', value: 1 }, // при добавлении нового типа счетчика, добавь информацию
            { text: 'Меркурий 204 ARTM2-02 DPOBH.G1', value: 2 }, // по парсингу серийного номера в AddOrEditDialog
            { text: 'Меркурий 234 ARTM2-02 POBR.G', value: 3 }, //плюс нужно ли на бэкенде отправлять смс?
            { text: 'Меркурий 234 ARTM2-03 PBR.G', value: 4 }, //после актуализации РТК + актуализация СТЭК(разделение на типы)
            { text: 'МИР С-04.10-230-5(100)-GRPZ1F-KQ-G-D', value: 5 }, //при выгрузке в Excel для пирамиды
            { text: 'МИР С-05.10-230-5(80)-G-KNQ-D', value: 6 },
            { text: 'МИР С-07.05S-230-5(10)-GR-Q-G-D', value: 7 },
            { text: 'Меркурий 203.2T GROB', value: 8 },
            { text: 'Меркурий 204 ARTM-02 DPOBR.G', value: 9 },
            { text: 'Меркурий 204 ARTM-02 POBR.G', value: 10 },
            { text: 'Меркурий 204 ARTM2-02 DPOBH.G', value: 11 },
            { text: 'Меркурий 204 ARTM2-02 DPOBR.G1', value: 12 },
            { text: 'Меркурий 234 ARTM-03 DPBR.G', value: 13 },
            { text: 'Меркурий 234 ARTM2-00 PBR.G', value: 14 },
            { text: 'Меркурий 234 ARTM2-02 DPOBR.G', value: 15 },
            { text: 'Энергомера СЕ207 R7.849.2.OG.QUVLF GS01', value: 16 },
            { text: 'Меркурий 204 ARTM-02 POB.G', value: 17 },
            { text: 'МИР C-05.10-230-5(80)-G2Z1B-KNQ-E-D', value: 18 },
            { text: 'Меркурий 234 ARTM2-03 DPBR.G', value: 19 },
            { text: 'МИР С-04.10-230-5(100)-Z1B-KNQ-E-D', value: 20 },
            { text: 'МИР С-04.10-230-5(100)-GPZ1F-KNQ-E-D', value: 21 },
            { text: 'МИР С-04.10-230-5(100)-GZ1B-KNQ-E-D', value: 22 },
            { text: 'МИРТЕК-212-РУ-W9', value: 23 },
            { text: 'Меркурий 234 ARTM-02 PB.G', value: 24 },
            { text: 'Энергомера СЕ303 S31746 JGVZ', value: 25 },
            { text: 'Меркурий 234 ARTM2-02 DPOBR.G1', value: 26 },
            { text: 'Энергомера CE208 S7.846.2.OG.QYUVFLZ GS01 SPDS', value: 27 },
            { text: 'Энергомера CE308 S34.746.OG.QYUVLFZ GS01 SPDS 3', value: 28 },
            { text: 'Энергомера CE308 S31.543.OAG.SYUVJLFZ GS01 SPDS', value: 29 },
            { text: 'РОТЕК РТМ-01 D2D3Y-31Y20-O21IS', value: 30 },
            { text: 'МИРТЕК-232-РУ-W32', value: 31 },
            { text: 'Энергомера CE308 S31.503.OAG.SYUVJLFZ GS01 SPDS', value: 32 },
        ],
        status: [
            { text: 'Действующий', value: 2 },
            { text: 'Отсутствует', value: 1 },
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
            return state.meters;
        },
        getPhases(state) {
            return state.phases;
        },
        getTypes(state) {
            return state.types;
        },
        getStatus(state) {
            return state.status;
        },
        getSmsStatus(state) {
            return state.smsStatus;
        },
        getIpAddress(state) {
            return state.ipAddress;
        },
       
    },
    mutations: {
        setMeters(state, meters) {
            state.meters = meters;
        },
        setLoading(state, bool) {
            state.isMetersLoading = bool
        },
    },
    actions: {
        async fetchMeters({ state, commit }, inPyramid) {
            try {
                commit('setLoading', true)
                const response = await axios.post(
                    this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/meters`,
                    { inPyramid: inPyramid },
                    { headers: { 'authorization': $cookies.get('auth_token') } })

                commit('setMeters', response.data)
                return response.data
            } finally {
                commit('setLoading', false)
            }
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

        async editMeter({state, commit}, { id, serial_number, type, phase, icc, index, port, address, contact, ip_address, parent_id, gateway  }) {
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

        async saveRefreshedMeterDataFromStek({ state, commit }, {id, data, personal_account, customer, customer_address, customer_phone, customer_email, customer_type}) {
            const response = await axios.put(
                this.state.serverUrl + `/api/${this.state.registration.serverModuleName}/save-refresh-meter-data-from-stek/` + id,
                {
                    personal_account,
                    customer,
                    customer_address,
                    customer_phone,
                    customer_email,
                    customer_type,
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
