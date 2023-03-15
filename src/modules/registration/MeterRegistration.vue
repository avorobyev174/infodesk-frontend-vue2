<template>
  <v-card>
    <v-data-table
        :headers="showHeaders"
        :items="meters"
        :loading="loading"
        :search="search"
        sort-by="id"
        height="80vh"
        class="elevation-1"
        :items-per-page="20"
        :footer-props="{
          showFirstLastPage: true,
          'items-per-page-text':'счетчиков на странице',
          'items-per-page-options': [10, 20, 40, 100]
        }"
        loading-text="Идет загрузка счетчиков..."
        fixed-header
    >
      <template v-slot:no-results>
        <span>Данные не найдены</span>
      </template>

      <template v-slot:top>
        <v-toolbar
          flat
          height="70px"
        >
          <!-- Поиск -->
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            hide-details
            clearable
            class="searchTextInput"
          />
          <v-spacer/>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                height="40px"
                class="mr-2"
                v-bind="attrs"
                @click="showMetersInPyramidOnClick"
                v-on="on"
              >
                <v-icon size="30px" :color="showPyramidIconColor">mdi-pyramid</v-icon>
              </v-btn>
            </template>
            <span>{{ showPyramidToolTipTitle }}</span>
          </v-tooltip>

          <!-- Кнопка меню функционала -->
          <main-menu
              class="pr-2"
              @update="initialize"
              @addOrEdit="$refs.addOrEditDialog.open()"
              @actualizeFromRTC="$refs.actualizeDataFromRTCDialog.open()"
              @groupSmsSend="$refs.singleAndGroupSmsSendDialog.open()"
              @groupSmsStatusCheck="$refs.singleAndGroupSmsSendDialog.checkSmsStatusForAllAvailableMeters()"
              @actualizeFromStek="$refs.actualizeDataFromStekDialog.open()"
              @showHideColums="$refs.showHideColumnsDialog.open()"
              @showBrokenMeters="$refs.brokenMetersDialog.open()"
          />
          <excel-menu
            @saveExcelDataToPyramid="$refs.saveDataToExcelDialog.open()"
            @saveExcelRefreshDataToPyramid="$refs.saveRefreshDataToPyramidDialog.open()"
          />
          <!-- Диалог видимости колонок -->
          <show-hide-columns-dialog
            ref="showHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
          />
          <!-- Диалог добавления/изменения -->
          <add-or-edit-dialog
              :meters="meters"
              ref="addOrEditDialog"
          />
          <!-- Диалог акутализации данных из ростелекома-->
          <actualize-data-from-r-t-c-dialog
              :meters="meters"
              ref="actualizeDataFromRTCDialog"
          />
          <!-- Диалог групповой отправки смс -->
          <single-and-group-sms-send-dialog
              :meters="meters"
              ref="singleAndGroupSmsSendDialog"
          />
          <!-- Диалог акутализации данных из стэка-->
          <actualize-data-from-stek-dialog
            :meters="meters"
            ref="actualizeDataFromStekDialog"
          />
          <!-- Диалог сохранения данных в формате excel для пирамиды-->
          <save-data-to-excel-dialog
            :meters="meters"
            ref="saveDataToExcelDialog"
          />
          <!-- Диалог обновления данных загруженных счетчиков из стэка-->
          <refresh-data-from-stek-to-pyramid-dialog
              :meters="meters"
              ref="saveRefreshDataToPyramidDialog"
          />
          <!-- Диалог утилизации счетчика-->
          <mark-meter-dialog
            :meters="meters"
            ref="markMeterDialog"
          />
          <broken-meters-dialog
            ref="brokenMetersDialog"
          />
          <!-- Диалоги установки и удаления признака загрузки в пирамиду-->
          <simple-dialog
              :dialog-open="removeInPyramidLoadValueDialogDeleteModel"
              max-width="600px"
              title="Вы уверены что хотите убрать признак загрузки в пирамиду?"
              @okButtonClickEvent="removePyramidLoadValue"
              @cancelButtonClickEvent="closeDialogRemovePyramidLoadValue"
          />
          <simple-dialog
              :dialog-open="addInPyramidLoadValueDialogDeleteModel"
              max-width="600px"
              title="Вы уверены что хотите установить признак загрузки в пирамиду?"
              @okButtonClickEvent="addPyramidLoadValue"
              @cancelButtonClickEvent="closeDialogAddPyramidLoadValue"
          />
        </v-toolbar>
      </template>

      <!-- Кнопки действий удаления/изменения/отправки смс/получения статуса смс -->
      <template v-slot:item.actions="{ item }">
        <action-column
            ref="actionColumn"
            @edit="$refs.addOrEditDialog.edit(item)"
            @delete="$refs.addOrEditDialog.delete(item)"
            @smsSend="$refs.singleAndGroupSmsSendDialog.smsConfirmDialogOpen(item)"
            @smsCheckStatus="$refs.singleAndGroupSmsSendDialog.checkSmsStatus(item)"
            @marked="$refs.markMeterDialog.open(item)"
            @removePyramidLoadValue="dialogRemovePyramidLoadValueOpen(item)"
            @addPyramidLoadValue="dialogAddPyramidLoadValueOpen(item)"
            @actualizeDataFromStek="$refs.actualizeDataFromStekDialog.actualizeSingleData(item)"
            :disabledActions="disableColumnActions"
        />
      </template>

      <!-- Подмена значений таблицы на лэйблы -->
      <template v-slot:item.sms_status="{ item }">
        <v-chip
          :color="getSmsColorByStatus(item.sms_status)"
          dark
        >
          {{ getSmsTitleBySmsStatus(item.sms_status) }}
        </v-chip>
      </template>
      <template v-slot:item.type="{ item }">
        {{ getMeterTypeTitle(item.type) }}
      </template>
      <template v-slot:item.phase="{ item }">
        {{ getPhaseTitle(item.phase) }}
      </template>
      <template v-slot:item.ip_address="{ item }">
        {{ getIpAddressTitle(item.ip_address) }}
      </template>
      <template v-slot:item.status="{ item }">
        {{ getStatusTitle(item.status) }}
      </template>
      <template v-slot:item.in_pyramid="{ item }">
        <v-chip v-if="item.in_pyramid === 0" :color="colorGrey">Не загружен</v-chip>
        <v-chip v-else :color="colorGreen">Загружен</v-chip>
      </template>
      <template v-slot:item.prog_value="{ item }">
          <v-icon
            v-if="item.prog_value === 0"
            size="25"
            class="ma-2"
            :color="colorGrey"
          >
            mdi-checkbox-blank-circle-outline
          </v-icon>
        <v-icon
          v-else-if="item.prog_value === 1"
          size="25"
          class="ma-2"
          :color="colorBlue"
        >
          mdi-checkbox-marked-circle-outline
        </v-icon>
        <v-icon
          v-else
          size="25"
          class="ma-2"
          :color="colorGreen"
        >
          mdi-checkbox-marked-circle-plus-outline
        </v-icon>
      </template>

      <!-- Когда нет данных -->
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Перезагрузить
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
import ButtonWithTooltip from "../utils-components/ButtonWithTooltip"
import SaveDataToExcelDialog from "./components/SaveDataToExcelDialog"
import ActionColumn from "./components/ActionColumn"
import MarkMeterDialog from "./components/MarkMeterDialog"
import ActualizeDataFromStekDialog from "./components/ActualizeDataFromStekDialog"
import AddOrEditDialog from "./components/AddOrEditDialog"
import ActualizeDataFromRTCDialog from "./components/ActualizeDataFromRTCDialog"
import SingleAndGroupSmsSendDialog from "./components/SingleAndGroupSmsSendDialog"
import MainMenu from "./components/MainMenu"
import ShowHideColumnsDialog from "./components/ShowHideColumnsDialog"
import ExcelMenu from "./components/ExcelMenu"
import RefreshDataFromStekToPyramidDialog from "./components/RefreshDataFromStekToPyramidDialog"
import SimpleDialog from "../utils-components/SimpleDialog"
import BrokenMetersDialog from "./components/BrokenMetersDialog"

export default {
  name: "MeterRegistration",
  components: {
    RefreshDataFromStekToPyramidDialog,
    ExcelMenu,
    buttonWithTooltip: ButtonWithTooltip,
    saveDataToExcelDialog: SaveDataToExcelDialog,
    actionColumn: ActionColumn,
    markMeterDialog: MarkMeterDialog,
    actualizeDataFromStekDialog: ActualizeDataFromStekDialog,
    addOrEditDialog: AddOrEditDialog,
    actualizeDataFromRTCDialog: ActualizeDataFromRTCDialog,
    singleAndGroupSmsSendDialog: SingleAndGroupSmsSendDialog,
    mainMenu: MainMenu,
    showHideColumnsDialog: ShowHideColumnsDialog,
    simpleDialog: SimpleDialog,
    brokenMetersDialog: BrokenMetersDialog
  },
  data: () => ({
    removeInPyramidLoadValueDialogDeleteModel: false,
    addInPyramidLoadValueDialogDeleteModel: false,
    removeOrAddInPyramidLoadValueItem: null,
    showMetersInPyramid: false,
    showPyramidIconColor: 'grey',
    showPyramidToolTipTitle: 'Показать загруженные в пирамиду',
    showMetersBroken: false,
    moduleName: 'meter_registration',
    settings: ['columns'],
    search: '',
    selectedHeaders: [],
    disableColumnActions: false,
    headers: [
      { text: 'ID', align: 'center', value: 'id', index: 0},
      { text: 'Тип', value: 'type', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 1 },
      { text: 'Серийный номер', value: 'serial_number', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 2 },
      { text: 'Фазность', value: 'phase', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 3 },
      { text: 'Номер телефона(счетчик)', value: 'phone', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 4 },
      { text: 'IP адрес', value: 'ip_address', sortable: true, align: 'center', cellClass: 'table-small-cell', index: 5 },
      { text: 'Порт', value: 'port', align: 'center', cellClass: 'table-small-cell', index: 6 },
      { text: 'ICC', value: 'icc', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 7 },
      { text: 'IMEI', value: 'imei', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 8 },
      { text: 'Статус', value: 'status', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 9 },
      { text: 'Связной', value: 'contact', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 10 },
      { text: 'Принадлежность ПУ', value: 'address', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 11 },
      { text: 'Пирамида', value: 'in_pyramid', align: 'center', sortable: false, index: 12 },
      { text: 'Номер лицевого', value: 'personal_account', sortable: true, align: 'center', cellClass: 'table-small-cell', index: 13 },
      { text: 'Наименование', value: 'customer', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 14 },
      { text: 'Тип клиента', value: 'customer_type', sortable: true, align: 'center', cellClass: 'table-small-cell', index: 15 },
      { text: 'Адрес', value: 'customer_address', sortable: true, align: 'center', cellClass: 'table-small-cell', index: 16 },
      { text: 'Номер телефона(клиент)', value: 'customer_phone', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 17 },
      { text: 'Почта', value: 'customer_email', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 18 },
      { text: 'Смс', value: 'sms_status', align: 'center', cellClass: 'table-small-cell', index: 19 },
      { text: 'Шлюз', value: 'gateway', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 20 },
      { text: 'Настройка данных', value: 'prog_value', sortable: true, align: 'center', cellClass: 'table-small-cell', index: 21},
      { text: 'Действия', value: 'actions', sortable: false, align: 'center', cellClass: 'table-small-cell', index: 22 },
    ],
  }),
  inject: ['showNotification', 'showNotificationStandardError', 'checkAuth'],
  provide: function () {
    return {
      getMeterTypeTitle: this.getMeterTypeTitle,
      getPhaseTitle: this.getPhaseTitle,
      getStatusTitle: this.getStatusTitle,
      getSmsTitleBySmsStatus: this.getSmsTitleBySmsStatus,
      getIpAddressTitle: this.getIpAddressTitle,
      moduleName: this.moduleName
    }
  },
  computed: {
    ...mapGetters({
      meters: 'registration/getMeters',
      phases: 'registration/getPhases',
      types: 'registration/getTypes',
      status: 'registration/getStatus',
      smsStatus: 'registration/getSmsStatus',
      ipAddresses: 'registration/getIpAddress',
      getCookies: 'getCookies'
    }),
    ...mapState({
      loading: state => state.registration.isMetersLoading,
      colorBlue: state => state.colorBlue,
      colorRed: state => state.colorRed,
      colorGreen: state => state.colorGreen,
      colorOrange: state => state.colorOrange,
      colorGrey: state => state.colorGrey,
      colorGold: state => state.colorGold,
    }),
    showHeaders () {
      return this.headers.filter(header => this.selectedHeaders.includes(header))
    }
  },
  created() {
    this.setCookies()
    $cookies.get('meter_registration_columns')
      ? this.changeColumnsVisibility($cookies.get('meter_registration_columns').split(',').map(column => parseInt(column)))
      : this.selectedHeaders = this.headers

    const isFavorite = $cookies.get('common_favorite_module')
    if (isFavorite === '/registration') {
      this.setFavoriteModuleColor(this.colorGold)
    } else {
      this.setFavoriteModuleColor('')
    }
  },
  mounted() {
    if (!this.checkAuth())
      return

    if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length)
      this.$router.push('/')

    this.fetchMeters(this.showMetersInPyramid).then(
      result => {},
      e => this.showNotificationStandardError(e)
    )

    document.onkeydown = () => {
      const route = this.$route.name === 'Registration'
      if (window.event.keyCode == 107 &&
              this.$refs &&
              this.$refs.addOrEditDialog &&
              route)
         this.$refs.addOrEditDialog.open()

      if (window.event.keyCode == 18 && route)
        this.initialize()
    }
  },
  methods: {
    ...mapMutations('registration', ['setMeters']),
    ...mapMutations(['setFavoriteModuleColor']),
    ...mapActions('registration', [
      'fetchMeters',
      'fetchBrokenMeters',
      'getNonActiveInPyramidMeters',
      'removeMeterPyramidLoadValue',
      'addMeterPyramidLoadValue'
    ]),

    setCookies() {
      if (this.getCookies)
        this.settings.forEach(setting => this.checkAndSetCookieValue(setting))
    },

    //Обработка куки
    checkAndSetCookieValue(settings) {
      const cookieName = `${this.moduleName}_${settings}`
      if (!$cookies.get(cookieName)) {
        const module = this.getCookies[this.moduleName]
        if (module) {
          const cookie = module.find(cookie => cookie.settings === settings)
          if (cookie)
            $cookies.set(cookieName, cookie.value, '4h')
        }
      }
    },

    changeColumnsVisibility(columns) {
      this.selectedHeaders = this.headers.filter(header => columns.includes(header.index))
    },

    getSmsColorByStatus(smsStatus) {
      return this.smsStatus.find(status => smsStatus === status.value).color
    },

    getSmsTitleBySmsStatus(smsStatus) {
      return this.smsStatus.find(status => smsStatus === status.value).title
    },

    getMeterTypeTitle(meterType) {
      return this.types.find(type => meterType === type.value).text
    },

    getStatusTitle(meterStatus) {
      const status = this.status.find(status => meterStatus === status.value)
      if (status !== undefined)
        return status.text
      else
        return null
    },

    getPhaseTitle(meterPhase) {
      return this.phases.find(phase => meterPhase === phase.value).text
    },

    getIpAddressTitle(ipAddress) {
      return this.ipAddresses.find(address => ipAddress === address.value).text
    },

    //Обработчик события ручной загрузки данных
    initialize() {
      this.fetchMeters(this.showMetersInPyramid).then(
        result => {
          this.showNotification(`Список счетчиков успешно обновлен`, this.colorGreen)
          this.showPyramidIconColor = this.showMetersInPyramid ? 'primary' : 'grey'
          this.showPyramidToolTipTitle = this.showMetersInPyramid ? 'Скрыть загруженные в пирамиду' : 'Показать загруженные в пирамиду'
        },
        e => this.showNotificationStandardError(e)
      )
    },

    showPyramidMeters() {
      this.initialize()
    },

    dialogRemovePyramidLoadValueOpen(item) {
      if (item.in_pyramid === 0)
        this.showNotification(`Счетчик еще не загружен в пирамиду`, this.colorOrange)
      else {
        this.removeOrAddInPyramidLoadValueItem = item
        this.removeInPyramidLoadValueDialogDeleteModel = true
      }
    },

    removePyramidLoadValue() {
       if (this.removeOrAddInPyramidLoadValueItem) {
         this.removeMeterPyramidLoadValue(this.removeOrAddInPyramidLoadValueItem).then(
           result => {
             Object.assign(this.removeOrAddInPyramidLoadValueItem, result)
             this.showNotification(`Счетчик успешно отредактирован`, this.colorGreen)
             this.closeDialogRemovePyramidLoadValue()
           },
           e => this.showNotificationStandardError(e)
         )
       } else {
         this.showNotification(`Произошла ошибка при редактировании счетчика`, this.colorRed)
         this.closeDialogRemovePyramidLoadValue()
       }
    },

    closeDialogRemovePyramidLoadValue() {
      this.removeInPyramidLoadValueDialogDeleteModel = false
      this.removeOrAddInPyramidLoadValueItem = null
    },

    dialogAddPyramidLoadValueOpen(item) {
      if (item.in_pyramid === 1)
        this.showNotification(`Счетчик уже загружен в пирамиду`, this.colorOrange)
      else {
        this.removeOrAddInPyramidLoadValueItem = item
        this.addInPyramidLoadValueDialogDeleteModel = true
      }
    },

    closeDialogAddPyramidLoadValue() {
      this.addInPyramidLoadValueDialogDeleteModel = false
      this.removeOrAddInPyramidLoadValueItem = null
    },

    addPyramidLoadValue() {
      if (this.removeOrAddInPyramidLoadValueItem) {
        this.addMeterPyramidLoadValue(this.removeOrAddInPyramidLoadValueItem).then(
          result => {
            Object.assign(this.removeOrAddInPyramidLoadValueItem, result)
            this.showNotification(`Счетчик успешно отредактирован`, this.colorGreen)
            this.closeDialogAddPyramidLoadValue()
          },
          e => this.showNotificationStandardError(e)
        )
      } else {
        this.showNotification(`Произошла ошибка при редактировании счетчика`, this.colorRed)
        this.closeDialogAddPyramidLoadValue()
      }
    },

    showMetersInPyramidOnClick() {
      this.showMetersInPyramid = !this.showMetersInPyramid
      this.showPyramidMeters()
    }
  }
}
</script>

<style>
  .table-small-cell {
    font-size: 12px !important;
  }

  td {
    text-align: center !important;
  }

  .selected-headers {
      max-width: 450px;
  }

  .searchTextInput {
    max-width: 350px;
  }
</style>