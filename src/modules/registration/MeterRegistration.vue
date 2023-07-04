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
            moduleName="programming"
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
          <simple-dialog
              :dialog-open="programmingDialogModel"
              max-width="700px"
              title="Вы уверены что хотите подтвердить изменение данных в пирамиде?"
              @okButtonClickEvent="setProgrammingDone"
              @cancelButtonClickEvent="closeProgrammingDoneDialog"
          ></simple-dialog>
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
            :actions="actions"
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
      <template v-slot:item.created="{ item }">
          {{ formatDate(item.created) }}
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
        <v-chip v-else :color="colorGreen">Загружен {{ item.loaded ? formatDate(item.loaded) : '' }}</v-chip>
      </template>
      <template v-slot:item.prog_value="{ item }">
        <v-tooltip bottom v-if="item.prog_value === 1">
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              size="25"
              class="ma-2"
              v-bind="attrs"
              v-on="on"
              :color="colorBlue"
              @click="openProgrammingDoneDialog(item)"
            >
              mdi-checkbox-marked-circle-outline
            </v-icon>
          </template>
          <span>Подтвердить изменение данных</span>
        </v-tooltip>
        <v-icon
          v-else-if="item.prog_value === 2"
          size="25"
          class="ma-2"
          :color="colorGreen"
        >
          mdi-checkbox-marked-circle-plus-outline
        </v-icon>
      </template>
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
import SaveDataToExcelDialog from "./components/SaveDataToExcelDialog"
import ActionColumn from "../utils-components/ActionColumn"
import MarkMeterDialog from "./components/MarkMeterDialog"
import ActualizeDataFromStekDialog from "./components/ActualizeDataFromStekDialog"
import AddOrEditDialog from "./components/AddOrEditDialog"
import ActualizeDataFromRTCDialog from "./components/ActualizeDataFromRTCDialog"
import SingleAndGroupSmsSendDialog from "./components/SingleAndGroupSmsSendDialog"
import MainMenu from "./components/MainMenu"
import ShowHideColumnsDialog from "../utils-components/ShowHideColumnsDialog"
import ExcelMenu from "./components/ExcelMenu"
import RefreshDataFromStekToPyramidDialog from "./components/RefreshDataFromStekToPyramidDialog"
import SimpleDialog from "../utils-components/SimpleDialog"
import BrokenMetersDialog from "./components/BrokenMetersDialog"
import RegistrationMixin from "./mixins/RegistrationMixin"

export default {
  name: "MeterRegistration",
  components: {
    RefreshDataFromStekToPyramidDialog,
    ExcelMenu,
    saveDataToExcelDialog: SaveDataToExcelDialog,
    actionColumn: ActionColumn,
    markMeterDialog: MarkMeterDialog,
    actualizeDataFromStekDialog: ActualizeDataFromStekDialog,
    AddOrEditDialog,
    actualizeDataFromRTCDialog: ActualizeDataFromRTCDialog,
    singleAndGroupSmsSendDialog: SingleAndGroupSmsSendDialog,
    mainMenu: MainMenu,
    showHideColumnsDialog: ShowHideColumnsDialog,
    simpleDialog: SimpleDialog,
    brokenMetersDialog: BrokenMetersDialog
  },
  data: () => ({
    programmingDialogModel: false,
    currentItem: {},
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
      { text: 'ID', align: 'center', value: 'id' },
      { text: 'Дата создания', align: 'center', value: 'created' },
      { text: 'Тип', value: 'type', sortable: false, align: 'center', cellClass: 'table-small-cell', width: '150px' },
      { text: 'Серийный номер', value: 'serial_number', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Фазность', value: 'phase', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Сим карта', value: 'phone', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'IP адрес', value: 'ip_address', sortable: true, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Порт', value: 'port', align: 'center', cellClass: 'table-small-cell' },
      { text: 'ICC', value: 'icc', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'IMEI', value: 'imei', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Статус', value: 'status', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Связной', value: 'contact', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Принадлежность ПУ', value: 'address', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Пирамида', value: 'in_pyramid', align: 'center', sortable: false },
      { text: 'Номер лицевого', value: 'personal_account', sortable: true, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Наименование', value: 'customer', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Тип клиента', value: 'customer_type', sortable: true, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Адрес', value: 'customer_address', sortable: true, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Номер телефона', value: 'customer_phone', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Почта', value: 'customer_email', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Смс', value: 'sms_status', align: 'center', cellClass: 'table-small-cell' },
      { text: 'Шлюз', value: 'gateway', sortable: false, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Коэффциент трансформации', value: 'kftt', sortable: true, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Настройка данных', value: 'prog_value', sortable: true, align: 'center', cellClass: 'table-small-cell' },
      { text: 'Действия', value: 'actions', sortable: false, align: 'center', cellClass: 'table-small-cell' },
    ],
    actions: [
      { title: 'Изменить', action: 'edit', icon: 'mdi-pencil' },
      { title: 'Удалить', action: 'delete', icon: 'mdi-delete' },
      { title: 'Отправить смс', action: 'smsSend', icon: 'mdi-email-arrow-right' },
      { title: 'Узнать статус смс', action: 'smsCheckStatus', icon: 'mdi-email-check' },
      { title: 'Списать', action: 'marked', icon: 'mdi-alert-remove'},
      { title: 'Установить признак загрузки в пирамиду', action: 'addPyramidLoadValue', icon: 'mdi-pyramid' },
      { title: 'Убрать признак загрузки в пирамиду', action: 'removePyramidLoadValue', icon: 'mdi-pyramid-off' },
      { title: 'Актуализировать данные из СТЕКа', action: 'actualizeDataFromStek', icon: 'mdi-database-import' },
    ]
  }),
  inject: [
    'showNotificationSuccess',
    'showNotificationError',
    'showNotificationWarning',
    'showNotificationRequestError',
  ],
  provide: function () {
    return {
      formatDate: this.formatDate,
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
      types: 'registration/getTypes',
      getCookies: 'getCookies',
      isLogin: 'getIsLogin',
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
    this.headers = this.headers.map((header, i) => ({ ... header, index: i }))
    $cookies.get('meter_registration_columns')
      ? this.changeColumnsVisibility($cookies.get('meter_registration_columns').split(',').map(column => parseInt(column)))
      : this.selectedHeaders = this.headers

    const isFavorite = $cookies.get('common_favorite_module')
    if (isFavorite === '/programming') {
      this.setFavoriteModuleColor(this.colorGold)
    } else {
      this.setFavoriteModuleColor('')
    }
  },
  mixins: [ RegistrationMixin ],
  mounted() {
    if (!this.isLogin) {
      return
    }

    this.fetchTypes().then(
        result => this.fetchMeters(this.showMetersInPyramid),
        error => this.showNotificationRequestError(error)
    )

    document.onkeydown = (evt) => {
      if (this.$route.name !== 'Programming') {
        return
      }
      if (evt.key === '+' && this.$refs.addOrEditDialog) {
        this.$refs.addOrEditDialog.open()
      }

      if (evt.key === 'Alt') {
        this.initialize()
      }
    }
  },
  methods: {
    ...mapMutations(['setFavoriteModuleColor']),
    ...mapActions('registration', [
      'fetchMeters',
      'fetchTypes',
      'fetchBrokenMeters',
      'getNonActiveInPyramidMeters',
      'removeMeterPyramidLoadValue',
      'addMeterPyramidLoadValue',
    ]),
    ...mapActions('repair', [
      'setProgrammingValue'
    ]),

    setCookies() {
      if (this.getCookies) {
        this.settings.forEach((settings) => this.checkAndSetCookieValue(settings))
      }
    },

    //Обработка куки
    checkAndSetCookieValue(settings) {
      const cookieName = `${this.moduleName}_${settings}`
      if (!$cookies.get(cookieName)) {
        const module = this.getCookies[this.moduleName]
        if (module) {
          const cookie = module.find(cookie => cookie.settings === settings)
          if (cookie) {
            $cookies.set(cookieName, cookie.value, '4h')
          }
        }
      }
    },

    changeColumnsVisibility(columns) {
      this.selectedHeaders = this.headers.filter(({ index }) => columns.includes(index))
    },

    //Обработчик события ручной загрузки данных
    async initialize() {
      try {
        await this.fetchMeters(this.showMetersInPyramid)
        this.showNotificationSuccess(`Список счетчиков успешно обновлен`)
        this.showPyramidIconColor = this.showMetersInPyramid ? 'primary' : 'grey'
        this.showPyramidToolTipTitle = this.showMetersInPyramid ? 'Скрыть загруженные в пирамиду' : 'Показать загруженные в пирамиду'
      } catch (e) {
        this.showNotificationRequestError(e)
      }
    },

    showPyramidMeters() {
      this.initialize()
    },

    dialogRemovePyramidLoadValueOpen(item) {
      if (item.in_pyramid === 0)
        this.showNotificationWarning(`Счетчик еще не загружен в пирамиду`)
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
             this.showNotificationSuccess(`Счетчик успешно отредактирован`)
             this.closeDialogRemovePyramidLoadValue()
           },
           e => this.showNotificationRequestError(e)
         )
       } else {
         this.showNotificationError('Произошла ошибка при редактировании счетчика')
         this.closeDialogRemovePyramidLoadValue()
       }
    },

    closeDialogRemovePyramidLoadValue() {
      this.removeInPyramidLoadValueDialogDeleteModel = false
      this.removeOrAddInPyramidLoadValueItem = null
    },

    dialogAddPyramidLoadValueOpen(item) {
      if (item.in_pyramid === 1)
        this.showNotificationWarning('Счетчик уже загружен в пирамиду')
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
            this.showNotificationSuccess('Счетчик успешно отредактирован')
            this.closeDialogAddPyramidLoadValue()
          },
          e => this.showNotificationRequestError(e)
        )
      } else {
        this.showNotificationError('Произошла ошибка при редактировании счетчика')
        this.closeDialogAddPyramidLoadValue()
      }
    },

    showMetersInPyramidOnClick() {
      this.showMetersInPyramid = !this.showMetersInPyramid
      this.showPyramidMeters()
    },

    openProgrammingDoneDialog(item) {
      this.programmingDialogModel = true
      this.currentItem = item
    },

    async setProgrammingDone() {
      this.closeProgrammingDoneDialog()
      try {
        const updatedMeter = await this.setProgrammingValue({ id: this.currentItem.id, value: 2 })
        const mainUpdatedMeter = this.meters.find(mainMeter => updatedMeter.id === mainMeter.id)
        Object.assign(mainUpdatedMeter, updatedMeter)
        this.showNotificationSuccess('Информаця успешно обновлена')
      } catch (e) {
        this.showNotificationRequestError(e)
      }
    },

    closeProgrammingDoneDialog() {
      this.programmingDialogModel = false
    }
  }
}
</script>

<style scoped>
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