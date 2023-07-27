import { get } from "axios"

export const dictionary = {
    state: () => ({
        dictionaries: {},
        assignmentEventTypes: [],
        assignmentCloseReasonTypes: [],
        assignmentStatuses: [],
        accounts: [],
        meterTypes: [],
        ipAddresses: [],
        simStatuses: [],
        accuracy: [],
        conditions: [],
        locations: [],
        operations: [],
        lvStates: [],
        owners: [],
        materialTypes: [],
        meterProgrammingTypes: [],
        storageEmployees: [],
        phases: [],
        smsStatus: [],
        storageEmployeesModified: [],
        parseOptions: [],
        programmingLogTypes: [],
    }),

    getters: {
        getDictionaries(state) {
            return state.dictionaries
        },
    
        getMeterTypes(state) {
            return state.meterTypes
        },
    
        getStorageEmployeesModified(state) {
            return state.storageEmployeesModified
        },
    
        getMeterProgrammingTypes(state) {
            return state.meterProgrammingTypes
        },
    
        getAssignmentEventTypes(state) {
            return state.assignmentEventTypes
        },
    
        getAssignmentCloseReasonTypes(state) {
            return state.assignmentCloseReasonTypes
        },
    
        getAccounts(state) {
            return state.accounts
        },
    
        getAssignmentStatuses(state) {
            return state.assignmentStatuses
        },
    
        getSimStatuses(state) {
            return state.simStatuses
        },
    
        getIpAddresses(state) {
            return state.ipAddresses
        },
    
        getAccuracy(state) {
            return state.accuracy
        },
    
        getConditions(state) {
            return state.conditions
        },
    
        getLocations(state) {
            return state.locations
        },
    
        getOperations(state) {
            return state.operations
        },
    
        getLvStates(state) {
            return state.lvStates
        },
    
        getOwners(state) {
            return state.owners
        },
        
        getMaterialTypes(state) {
            return state.materialTypes
        },
    
        getStorageEmployees(state) {
            return state.storageEmployees
        },
    
        getPhases(state) {
            return state.phases
        },
    
        getSmsStatuses(state) {
            return state.smsStatus
        },
    
        getParseOptions(state) {
            return state.parseOptions
        },
    
        getProgrammingLogTypes(state) {
            return state.programmingLogTypes
        },
    },

    mutations: {
        setDictionaries(state, dictionaries) {
            const {
                assignmentEventTypes,
                assignmentCloseReasonTypes,
                accounts,
                meterTypes,
                ipAddresses,
                simStatuses,
                assignmentStatuses,
                accuracy,
                conditions,
                locations,
                operations,
                lvStates,
                owners,
                materialTypes,
                storageEmployees,
                phases,
                smsStatus,
                options,
                programmingLogTypes,
            } = dictionaries
    
            state.assignmentEventTypes = assignmentEventTypes
            state.assignmentCloseReasonTypes = assignmentCloseReasonTypes
            state.accounts = accounts
            state.meterTypes = meterTypes
            state.meterProgrammingTypes = meterTypes.filter(({ is_prog }) => is_prog)
            state.ipAddresses = ipAddresses
            state.simStatuses = simStatuses
            state.assignmentStatuses = assignmentStatuses
            state.dictionaries = dictionaries
            state.accuracy = accuracy
            state.conditions = conditions
            state.locations = locations
            state.operations = operations
            state.lvStates = lvStates
            state.owners = owners
            state.materialTypes = materialTypes
            state.programmingLogTypes = programmingLogTypes
            state.storageEmployees = storageEmployees.map(({ name, staff_id, card }) => {
                const [ secondName, firstName ] = name.trim().split(' ')
                return {
                    staff_id,
                    name: `${ secondName } ${ firstName.at(0) }.`,
                    card
                }
            })
            state.storageEmployeesModified = state.storageEmployees.map(({ name, staff_id }) => ({ title: name, value: staff_id }))
            state.phases = phases
            state.smsStatus = smsStatus
            state.parseOptions = options
        },
    },

   actions: {
        async fetchDictionaries({ commit }) {
            const response = await get(
                this.state.serverUrl + `/api/common/dictionaries`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            const { data } = response
            const dictionaries = {}
            for (const { title, value } of data) {
                dictionaries[ title ] = value
            }
            
            commit('setDictionaries', dictionaries)
        },
   },
    namespaced: true
}
