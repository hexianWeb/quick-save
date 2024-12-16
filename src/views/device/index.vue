<template>
  <div class="page">
    <div class="container">
      <!-- 顶部左侧 -->
      <div class="item left">
        John
        <div class="center">
          <el-date-picker
            v-model="value2"
            type="date"
            placeholder="Pick a Date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            @change="pickDate"
          />
          <div class="btn-date">
            <div @click="leftDate">
              <i class="el-icon-arrow-left" />
            </div>
            <div @click="rightDate">
              <i class="el-icon-arrow-right" />
            </div>
          </div>
        </div>
      </div>
      <div class="item ">
        <!-- <div class="flex-center">
          <div> Certified: No</div>
          <div>Worked hours: 07:28</div>
          <div> Violations: No</div>
        </div> -->
        <div class="device">
          <div class="chart-container">
            <div ref="chart1" class="chart" />
            <div class="chart-title">
              <span style="color:#f2994a;">{{ showTime(1) }}</span>
              <span>BREAK</span>
            </div>
          </div>
          <div class="chart-container">
            <div ref="chart2" class="chart" />
            <div class="chart-title">
              <span style="color: #2eb065;">{{ showTime(2) }}</span>
              <span>DRIVE</span>
            </div>
          </div>
          <div class="chart-container">
            <div ref="chart3" class="chart" />
            <div class="chart-title">
              <span style="color: #2989c0;">{{ showTime(3) }}</span>
              <span>SHIFT</span>
            </div>
          </div>
          <div class="chart-container">
            <div ref="chart4" class="chart" />
            <div class="chart-title">
              <span style="color: #eb5757;">{{ showTime(4) }}</span>
              <span>CYCLE</span>
            </div>
          </div>
        </div>
      </div>
      <div class="item right">
        <div class="flex-center1">
          <button class="btn">Tracking</button>
          <button class="btn">Report</button>
          <button class="btn">Current Location</button>
        </div>
      </div>
    </div>
    <!-- 进度条 -->
    <div class="progress">
      <scaleLine :labels="labelData" :time-data="timeData" :is-debug="isDebug" @toolClick="showTooltip" />
    </div>
    <!-- table -->
    <div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="NO" label="NO" width="180">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Status" width="180">
          <template slot-scope="scope">
            <div class="capsule" :style="{ background: scope.row.color }">
              {{ scope.row.column1 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="Duration" label="START(EST)">
          <template slot-scope="scope">
            {{ scope.row.column2 }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="Duration" />
        <el-table-column prop="Location" label="Location" width="200">
          <template slot-scope="scope">
            <span v-if="scope.row.icon1 == 2" class="iconfont icon-playback" />
            <span v-else class="iconfont icon-addr" />
            {{ scope.row.lng }},{{ scope.row.lat }}
          </template>
        </el-table-column>
        <el-table-column prop="vehicle" label="Vehicle" />
        <el-table-column prop="odometer" label="Odometer" />
        <el-table-column prop="" label="Eng. hours" />
        <el-table-column prop="notes" label="Notes" />
        <el-table-column prop="documents" label="Document" />
        <el-table-column prop="trailers" label="Trailer" />
        <el-table-column label="Action">
          <span class="iconfont icon-edit" />
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
      <div>
        <el-form
          ref="ruleForm"
          style="width:97%"
          :model="ruleForm"
          :rules="rules"
          label-width="150px"
          class="demo-ruleForm"
        >
          <el-form-item label="Notes" prop="notes">
            <el-input v-model="ruleForm.notes" placeholder="Enter notes" />
          </el-form-item>
          <el-form-item label="Trailer number" prop="number">
            <el-input v-model="ruleForm.number" placeholder="Enter trailers" />
          </el-form-item>
          <el-form-item label="Shipping document" prop="document">
            <el-input v-model="ruleForm.document" placeholder="Enter documents" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getLogbookList, getCurrentStatus, changeStatus, getSettings } from '@/api/device'
import * as echarts from 'echarts'
import scaleLine from '@/components/scale-line/scale-line.vue'
// moment
import moment from '@/utils/moment'
export default {
  name: 'PieChart',
  components: {
    scaleLine
  },
  data() {
    return {
      tableData: [],
      ruleForm: {},
      rules: {
        // notes: [
        //   { required: true, message: 'This is required' }
        // ],
      },
      timeData: [],
      labelData: {
        0: 'DR 00:00',
        1: 'OFF 00:00',
        2: 'SB 00:00',
        3: 'ON 00:00'
      },
      dialogVisible: false,
      changeStatusPoup: false,
      form: {
        notes: '',
        number: '',
        document: ''
      },
      isDebug: false,
      value2: new Date().setHours(0, 0, 0, 0),
      chartData: [
        { value: 0.88, type: 'BREAK' },
        { value: 0.88, type: 'DRIVE' },
        { value: 0.88, type: 'SHIFT' },
        { value: 0.88, type: 'CYCLE' }
      ],
      list: null,
      remain: null,
      currentStatus: null
    }
  },
  computed: {

  },
  mounted() {
    this.getCurrentStatus()
    this.getLogbook()
    setTimeout(() => {
      this.initCharts()
    }, 1000)
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    submit(formName) {
      const vm = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          try {
            const params = {
              status: vm.changestatus,
              userId: vm.userInfo.userId,
              notes: vm.form.notes,
              trailers: vm.form.number,
              documents: vm.form.document
            }
            HttpRequest.post(this.apiUrl.post_change_status, params).then(res => {
              vm.coloseBottomPopue()
              this.activeStatus = this.incompleteStatus
              // uni.hideLoading();
              const response = res.data.data
              vm.remain = response.remain
              vm.updateAccumulatedTime(status, true)
              vm.diff = res.data.ts - new Date()
              vm.getPageData()
              console.log('vm.diff2 = ' + vm.diff)
              console.log('response = ' + JSON.stringify(response))
            })
          } catch (error) {
            console.error('获取时间失败:', error)
          }
        } else {
          console.log('验证失败')
        }
      })
    },
    // 关闭底部窗台选择
    coloseBottomPopue() {
      this.changeStatusPoup = false
      this.form = {
        notes: '',
        number: '',
        document: ''
      }
    },
    leftDate() {
      if (this.value2 == null) {
        this.value2 = new Date().setHours(0, 0, 0, 0)
      }
      this.value2 = this.value2 - 86400000
      this.getCurrentStatus()
    },
    rightDate() {
      if (this.value2 == null) {
        this.value2 = new Date().setHours(0, 0, 0, 0)
      }
      this.value2 = this.value2 + 86400000
      this.getCurrentStatus()
    },

    pickDate(days) {
      this.getCurrentStatus()
    },
    initCharts() {
      this.initChart(this.$refs.chart1, 1, '#f2994a', 'Break')
      this.initChart(this.$refs.chart2, 2, '#2eb065', 'drive')
      this.initChart(this.$refs.chart3, 3, '#2989c0', 'Shift')
      this.initChart(this.$refs.chart4, 4, '#eb5757', 'Cycle')
    },
    initChart(ref, type, color, title) {
      const chart = echarts.init(ref)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: false,
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['90%', '80%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.calcPercent(type), name: title, itemStyle: { color: color }},
              { value: 100 - this.calcPercent(type), name: '', itemStyle: { color: '#ececec' }}
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    },
    getLogbook() {
      const vm = this
      getLogbookList({
        start: this.value2 / 1000,
        end: ((this.value2 + 86399999) / 1000).toFixed(0)
      }).then(response => {
        // this.tableData=response.data.records;
        const accept = JSON.parse(JSON.stringify(response.data.records))
        const filteredArray = accept.filter(i => i.type == 1 && i.duration > 0)
        console.log(filteredArray, 1111333333333333333, 'tableData111')

        filteredArray.forEach(e => {
          this.tableData.push({
            color: e.status == 2 ? '#00e676' : e.status == 4 ? '#bbbbbb' : e.status == 3
              ? '#ff9800' : e.status == 1 ? '#00AEEF' : '',
            column1: e.status == 4 ? 'OFF' : e.status == 1 ? 'ON' : e.status == 2 ? 'DR' : e
              .status == 3 ? 'SB' : '',
            column2: e.start ? moment(e.start).format('HH:mm:ss') : '00:00:00',
            icon1: e.status,
            lat: e.lat,
            lng: e.lng,
            documents: e.documents,
            notes: e.notes,
            trailers: e.trailers,
            odometer: e.odometer,
            duration: e.duration

          })
        })
        console.log(this.tableData, 1111333333333333333)
      })
    },
    showTooltip(val) {
      console.log('接受', val)
      this.form = {
        notes: this.currentStatus.notes,
        number: this.currentStatus.trailers,
        document: this.currentStatus.documents
      }
      this.dialogVisible = true
    },
    getCurrentStatus() {
      const vm = this
      getCurrentStatus({
        start: this.value2 / 1000,
        end: ((this.value2 + 86399999) / 1000).toFixed(0)
      }).then(response => {
        const labels = response.logbookSummary
        if (labels && Object.values(labels)) {
          vm.labelData = {
            0: 'DR ' + vm.convertMinutesToTime(labels.totalDRSeconds),
            1: 'OFF ' + vm.convertMinutesToTime(labels.totalOFFSeconds),
            2: 'SB ' + vm.convertMinutesToTime(labels.totalSBSeconds),
            3: 'ON ' + vm.convertMinutesToTime(labels.totalONSeconds)
          }
        }
        vm.timeData = response.data.logbookList
        vm.list = response.data
        vm.remain = response.data.remain
        vm.isDebug = response.data.currentStatus.isDebug
        vm.currentStatus = response.data.currentStatus
        vm.initCharts()
      })
    },
    calcPercent(type) {
      let percent = 1
      const rm = this.remain
      // console.log("rm = " + JSON.stringify(rm));
      if (Object.keys(rm).length > 0) {
        if (type === 1) {
          percent = rm.remainContDRTime / rm.maxContDRTime
        }
        if (type === 2) {
          percent = rm.remainDRTime / rm.maxDRTime
        }
        if (type === 3) {
          percent = rm.remainONTime / rm.maxONTime
        }
        if (type === 4) {
          percent = rm.remainWeekONTime / rm.maxWeekONTime
        }
      }
      // console.log(rm.remainContDRTime ,rm.maxContDRTime ,"percent = " + percent,Math.floor(percent * 100));
      return Math.floor(percent * 100)
    },
    showTime(type) {
      let sec = 0
      if (type === 1) sec = this.remain.remainContDRTime
      if (type === 2) sec = this.remain.remainDRTime
      if (type === 3) sec = this.remain.remainONTime
      if (type === 4) sec = this.remain.remainWeekONTime
      return this.formatSeconds(sec)
    },
    formatSeconds(seconds) {
      const vm = this
      if (vm.currentStatus.isDebug) {
        // 如果是调试模式，格式化为 分:秒
        const minutes = Math.floor(seconds / 60) // 计算分钟
        const secs = seconds % 60 // 计算剩余秒数
        return `${minutes}:${secs.toString().padStart(2, '0')}` // 格式化为 分:秒
      } else {
        // 如果不是调试模式，格式化为 时:分
        const hours = Math.floor(seconds / 3600) // 计算小时
        const minutes = Math.floor((seconds % 3600) / 60) // 计算剩余分钟
        return `${hours}:${minutes.toString().padStart(2, '0')}` // 格式化为 时:分
      }
    }
  }
}
</script>

<style scoped>
.page {
  padding: 20px;
}

.container {
  display: flex;
  justify-content: space-between;
}

.item {
  width: 30%;
  height: 100px;
}

.left {
}

.center {
  margin-top: 20px;

  display: flex;
}

.device {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.chart-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.chart {
  width: 100px;
  height: 100px;
}

.chart-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #333;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.flex-center {
  display: flex;
  justify-content: space-between;
  align-items: center;

}
.flex-center1 {
  display: flex;
  justify-content: flex-end;
  align-items: center;

}
.btn {
  margin: 20px;
  height: 44px;
  padding: 0 15px;
  background-color: #f8f8f8;
  border: none;
  font-size: 14px;
  border-radius: 2px;
  cursor: pointer;
  color: #9a9a9c;
}

.btn:hover {
  color: black;
}

.btn-date {
  border: none;
  color: #a7a7a7;
  display: flex;
  background-color: #f8f9fb;
  height: 35px;
  width: 70px;
  margin-left: 20px;

}

.btn-date div {
  font-size: 16px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
}

.btn-date div:first-child {
  border-right: 1px solid #a7a7a7;
  border-radius: 3px 0 0 3px;
}

.btn-date div:last-child {
  border-radius: 0 3px 3px 0;
}

.capsule {
  width: 50px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  border-radius: 10px;
  font-weight: bold;
}

/* 进度条 */
.progress {
  height: 20vh;
  margin-top: 60px;
}

/* 表格样式 */
::v-deep tr {
  /* border-bottom: 0px solid #dfe6ec !important;
    border-top: 0px solid #dfe6ec !important; */
  border: 3px solid red !important;
}

::v-deep .el-table th.is-leaf,
.el-table td {
  border-bottom: 0px solid #dfe6ec;

}
::v-deep .el-input__inner{
  background-color: #f8f9fb;
  border: 0;
}
</style>
