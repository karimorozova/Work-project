<template lang="pug">
  .vdp-datepicker(:class="[wrapperClass, isRtl ? 'rtl' : '']")
    div(style="position: relative;" :class="{'input-group' : false}")
      <!-- Calendar Button -->
      span(v-if="calendarButton" class="vdp-datepicker__calendar-button" :class="{'input-group-addon' : false}" @click="showCalendar"
        v-bind:style="{'cursor:not-allowed;' : disabledPicker}")
        i.calendarButtonIcon {{ calendarButtonIconContent }}
          span(v-if="!calendarButtonIcon") &hellip;
      <!-- Input -->
      input(
        :type="inline ? 'hidden' : 'text'"
        :class="[inputClass,inputClass2]"
        :name="name"
        :ref="refName"
        @click="showCalendarReadonly"
        @change="setDateManually"
        :id="id"
        :value="formattedValue"
        :open-date="openDate"
        :placeholder="placeholder"
        :clear-button="clearButton"
        :disabled="disabledPicker"
        :required="required"
        :readonly="isReadonly"
      )
      <!-- Clear Icon -->
      span.clear-icon(v-if="isClearIcon && selectedDate" @click="removeSelectedDate()")
        i.fas.fa-backspace

      <!-- Clear Button -->
      span(v-if="clearButton && selectedDate" class="vdp-datepicker__clear-button" :class="{'input-group-addon' : false}" @click="clearDate()")
        i.clearButtonIcon
          span(v-if="!clearButtonIcon") &times;


    <!-- Day View -->
    template(v-if="allowedToShowView('day')")
      div(:class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showDayView" v-bind:style="calendarStyle")
        header
          span(
            @click="isRtl ? nextMonth() : previousMonth()"
            class="prev"
            v-bind:class="{ 'disabled' : isRtl ? nextMonthDisabled(pageTimestamp) : previousMonthDisabled(pageTimestamp) }"
          ) &lt;
          span(
            @click="showMonthCalendar"
            :class="allowedToShowView('month') ? 'up' : ''"
          ) {{ isYmd ? currYear : currMonthName }} {{ isYmd ? currMonthName : currYear }}
          span(
            @click="isRtl ? previousMonth() : nextMonth()"
            class="next"
            v-bind:class="{ 'disabled' : isRtl ? previousMonthDisabled(pageTimestamp) : nextMonthDisabled(pageTimestamp) }"
          ) &gt;
        .custom-fonts( :class="isRtl ? 'flex-rtl' : ''")
          span.cell.day-header( v-for="d in daysOfWeek" :key="d.timestamp") {{ d }}
          span.cell.day(
            v-for="day in days"
            :key="day.timestamp"
            track-by="timestamp"
            v-bind:class="dayClasses(day)"
            @click="setDay(day)"
          ) {{ day.date }}

        .time-select(v-if="isTime")
          .change-time.hour
            span(
              @click="() => checkHours(+hours+1)"
              class="prev"
            )
              i.fa.fa-chevron-up
            input.date-input(type="text" v-model="hours" maxlength="2" @click="selectAllText")
            span(
              @click="() => checkHours(hours-1)"
              class="next"
            )
              i.fa.fa-chevron-down
          .separator :
          .change-time.minute
            span(
              @click="() => checkMinutes(+minutes+1)"
              class="prev"
            )
              i.fa.fa-chevron-up
            input.date-input(type="text" v-model="minutes" maxlength="2" @click="selectAllText")
            span(
              @click="() => checkMinutes(minutes-1)"
              class="next"
            )
              i.fa.fa-chevron-down

        Button.select-date(value="Set date" @clicked="setDateAndTime()")


    <!-- Month View -->
    template( v-if="allowedToShowView('month')")
      div( :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showMonthView" v-bind:style="calendarStyle")
        header
          span.prev(
            @click="previousYear"
            v-bind:class="{ 'disabled' : previousYearDisabled(pageTimestamp) }"
          ) &lt;
          span( @click="showYearCalendar" :class="allowedToShowView('year') ? 'up' : ''") {{ getPageYear() }}
          span.next(
            @click="nextYear"
            v-bind:class="{ 'disabled' : nextYearDisabled(pageTimestamp) }"
          ) &gt;
        span.cell.month(
          v-for="month in months"
          :key="month.timestamp"
          track-by="timestamp"
          v-bind:class="{ 'selected': month.isSelected, 'disabled': month.isDisabled }"
          @click.stop="selectMonth(month)"
        ) {{ month.month }}


    <!-- Year View -->
    template( v-if="allowedToShowView('year')")
      div( :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showYearView" v-bind:style="calendarStyle")
        header
          span.prev(
            @click="previousDecade"
            v-bind:class="{ 'disabled' : previousDecadeDisabled(pageTimestamp) }"
          ) &lt;
          span {{ getPageDecade() }}
          span.next(
            @click="nextDecade"
            v-bind:class="{ 'disabled' : nextMonthDisabled(pageTimestamp) }"
          ) &gt;
        span.cell.year(
          v-for="year in years"
          :key="year.timestamp"
          track-by="timestamp"
          v-bind:class="{ 'selected': year.isSelected, 'disabled': year.isDisabled }"
          @click.stop="selectYear(year)"
        ) {{ year.year }}
</template>

<script>
	import DateUtils from '../../utils/DateUtils.js'
	import DateLanguages from '../../utils/DateLanguages.js'
	import moment from 'moment'
	import Button from "./Button"

	export default {
		components: { Button },
		props: {
			value: {
				validator: function (val) {
					return val === null || val instanceof Date || typeof val === 'string' || typeof val === 'number'
				}
			},
			name: String,
			refName: String,
			id: String,
			format: {
				type: [ String, Function ],
				default: 'dd MMM yyyy'
			},
			language: {
				type: String,
				default: 'en'
			},
			openDate: {
				validator: function (val) {
					return val === null || val instanceof Date || typeof val === 'string'
				}
			},
			fullMonthName: Boolean,
			disabled: Object,
			highlighted: Object,
			placeholder: String,
			inline: {
				type: Boolean,
        default: false,
      },
			isReadonly: {
				type: Boolean,
				default: true
			},
			calendarClass: [ String, Object ],
			inputClass: [ String, Object ],
			inputClass2: [ String, Object ],
			wrapperClass: [ String, Object ],
			mondayFirst: Boolean,
			clearButton: Boolean,
			clearButtonIcon: String,
			calendarButton: Boolean,
			calendarButtonIcon: String,
			calendarButtonIconContent: String,
			initialView: String,
			disabledPicker: Boolean,
			required: Boolean,
			minimumView: {
				type: String,
				default: 'day'
			},
			maximumView: {
				type: String,
				default: 'year'
			},
			isTime: { type: Boolean, default: true },
			isClearIcon: {
				type: Boolean,
				default: false
			}
		},
		data() {
			const startDate = this.openDate ? new Date(this.openDate) : new Date()
			return {
				pageTimestamp: startDate.setDate(1),
				selectedDate: null,
				showDayView: false,
				showMonthView: false,
				showYearView: false,
				calendarHeight: 0,
				day: '',
				hours: moment().hour(),
				minutes: moment().minute()
			}
		},
		watch: {
			value(value) {
				this.setValue(value)
			},
			openDate() {
				this.setPageDate()
			},
			initialView() {
				this.setInitialView()
			},
			hours(value) {
				const hours = parseInt((value + '').replace(/[^-\d]/g, '')) || 0
				if (hours > 23) {
					this.hours = 23
					return
				}
				this.hours = hours < 0 ? '0' : hours
			},
			minutes(value) {
				const minutes = parseInt((value + '').replace(/[^-\d]/g, '')) || 0
				if (minutes > 59) {
					this.minutes = 59
					return
				}
				this.minutes = minutes < 0 ? '0' : minutes
			}
		},
		computed: {
			computedInitialView() {
				if (!this.initialView) {
					return this.minimumView
				}
				return this.initialView
			},
			pageDate() {
				return new Date(this.pageTimestamp)
			},
			formattedValue() {
				if (!this.selectedDate) {
					return null
				}

				return typeof this.format === 'function'
						? this.format(this.selectedDate)
						: DateUtils.formatDate(new Date(this.selectedDate), this.format, this.translation)
			},
			translation() {
				return DateLanguages.translations[this.language]
			},
			currMonthName() {
				const monthName = this.fullMonthName ? this.translation.months.original : this.translation.months.abbr
				return DateUtils.getMonthNameAbbr(this.pageDate.getMonth(), monthName)
			},
			currYear() {
				return this.pageDate.getFullYear()
			},
			blankDays() {
				const d = this.pageDate
				let dObj = new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes())
				if (this.mondayFirst) {
					return dObj.getDay() > 0 ? dObj.getDay() - 1 : 6
				}
				return -1
			},
			daysOfWeek() {
				if (this.mondayFirst) {
					const tempDays = this.translation.days.slice()
					tempDays.push(tempDays.shift())
					return tempDays
				}
				return this.translation.days
			},
			days() {
				const d = this.pageDate
				let days = []
				// set up a new date object to the beginning of the current 'page'
				let dObj = new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes())
				let dow = dObj.getDay()
				if (this.mondayFirst) {
					dow = dow === 0 ? 7 : dow
				}
				if (dow > 0) {
					dObj.setDate((dow - 2) * -1)
				}
				let daysInMonth = DateUtils.daysInMonth(dObj.getFullYear(), dObj.getMonth())
				daysInMonth = 42
				for (let i = 0; i < daysInMonth; i++) {
					days.push({
						isNotCurrentMonth: dObj.getMonth() !== d.getMonth(),
						date: dObj.getDate(),
						timestamp: dObj.getTime(),
						isSelected: this.isSelectedDate(dObj),
						isDisabled: this.isDisabledDate(dObj),
						isHighlighted: this.isHighlightedDate(dObj),
						isHighlightStart: this.isHighlightStart(dObj),
						isHighlightEnd: this.isHighlightEnd(dObj),
						isToday: dObj.toDateString() === (new Date()).toDateString(),
						isBeforeToday: moment(dObj).isBefore(moment(), 'day'),
						isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
						isSaturday: dObj.getDay() === 6,
						isSunday: dObj.getDay() === 0
					})
					dObj.setDate(dObj.getDate() + 1)
				}
				return days
			},
			months() {
				const d = this.pageDate
				let months = []
				// set up a new date object to the beginning of the current 'page'
				let dObj = new Date(d.getFullYear(), 0, d.getDate(), d.getHours(), d.getMinutes())
				for (let i = 0; i < 12; i++) {
					months.push({
						month: DateUtils.getMonthName(i, this.translation.months.original),
						timestamp: dObj.getTime(),
						isSelected: this.isSelectedMonth(dObj),
						isDisabled: this.isDisabledMonth(dObj)
					})
					dObj.setMonth(dObj.getMonth() + 1)
				}
				return months
			},
			years() {
				const d = this.pageDate
				let years = []
				let dObj = new Date(Math.floor(d.getFullYear() / 10) * 10, d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())
				for (let i = 0; i < 10; i++) {
					years.push({
						year: dObj.getFullYear(),
						timestamp: dObj.getTime(),
						isSelected: this.isSelectedYear(dObj),
						isDisabled: this.isDisabledYear(dObj)
					})
					dObj.setFullYear(dObj.getFullYear() + 1)
				}
				return years
			},
			calendarStyle() {
				return {
					position: this.isInline ? 'static' : undefined
				}
			},
			isOpen() {
				return this.showDayView || this.showMonthView || this.showYearView
			},
			isInline() {
				return !!this.inline
			},
			isRtl() {
				return this.translation.rtl === true
			},
			isYmd() {
				return this.translation.ymd === true
			}
		},
		methods: {
			removeSelectedDate() {
				this.selectedDate = null
				this.$emit('removeSelectedDate')
			},
			close(full) {
				this.showDayView = this.showMonthView = this.showYearView = false
				if (!this.isInline) {
					if (full) this.$emit('closed')
					document.removeEventListener('click', this.clickOutside, false)
				}
			},
			resetDefaultDate() {
				if (this.selectedDate === null) {
					this.setPageDate()
					return
				}
				this.setPageDate(this.selectedDate)
			},
			showCalendar() {
				if (!this.isOpen) {
					this.$emit('isOpened')
				}
				if (this.disabledPicker || this.isInline) {
					return false
				}
				if (this.isOpen) {
					return this.close(true)
				}
				this.setInitialView()

				if (!this.isInline) {
					this.$emit('opened')
				}
			},
			showCalendarReadonly(event) {
				if (!this.isReadonly) {
					return
				}
				this.scrollDrop(event)
				if (this.disabledPicker || this.isInline) {
					return false
				}
				if (this.isOpen) {
					return this.close(true)
				}
				this.setInitialView()
				if (!this.isInline) {
					this.$emit('opened')
				}
			},
			scrollDrop(event) {
				let elementsObj = event.composedPath()
				let tr = elementsObj.find(item => {
					if (item.localName == "tr" || (item.className && item.className.indexOf("table__body-row") !== -1)) {
						return item
					}
				})
				let top = 0
				let height = 0
				if (tr) {
					top = tr.offsetTop
					height = tr.offsetHeight
				}
				this.$emit('scrollDrop', { drop: !this.isOpen, offsetTop: top, offsetHeight: height })
			},
			setDateManually(e) {
				const value = e.target.value
				const dateParts = value.split(", ")
				const dateString = dateParts[0].split("-").reverse().join("-") + "T" + dateParts[1]
				const newDate = moment(dateString).set({ hour: this.hours, minute: this.minutes }).format()
				if (isNaN(newDate.getTime())) {
					return this.$emit("invalidDate", { message: "Please set valid date" })
				}
				this.$emit('selected', newDate)
				this.$emit('input', newDate)
			},
			setInitialView() {
				const initialView = this.computedInitialView

				if (!this.allowedToShowView(initialView)) {
					throw new Error(`initialView '${ this.initialView }' cannot be rendered based on minimum '${ this.minimumView }' and maximum '${ this.maximumView }'`)
				}

				switch (initialView) {
					case 'year':
						this.showYearCalendar()
						break
					case 'month':
						this.showMonthCalendar()
						break
					default:
						this.showDayCalendar()
						break
				}
			},
			allowedToShowView(view) {
				const views = [ 'day', 'month', 'year' ]
				const minimumViewIndex = views.indexOf(this.minimumView)
				const maximumViewIndex = views.indexOf(this.maximumView)
				const viewIndex = views.indexOf(view)

				return viewIndex >= minimumViewIndex && viewIndex <= maximumViewIndex
			},
			showDayCalendar() {
				if (!this.allowedToShowView('day')) return false

				this.close()
				this.showDayView = true
				this.addOutsideClickListener()
			},
			showMonthCalendar() {
				if (!this.allowedToShowView('month')) return false

				this.close()
				this.showMonthView = true
				this.addOutsideClickListener()
			},
			showYearCalendar() {
				if (!this.allowedToShowView('year')) return false

				this.close()
				this.showYearView = true
				this.addOutsideClickListener()
			},
			addOutsideClickListener() {
				if (!this.isInline) {
					setTimeout(() => {
						document.addEventListener('click', this.clickOutside, false)
					}, 100)
				}
			},
			setDate(timestamp) {
				const date = new Date(timestamp)
				this.selectedDate = new Date(date)
				this.setPageDate(date)
				this.$emit('selected', new Date(date))
				this.$emit('input', new Date(date))
			},
			clearDate() {
				this.selectedDate = null
				this.$emit('selected', null)
				this.$emit('input', null)
				this.$emit('cleared')
			},
			setDateAndTime() {
				if (this.day.isDisabled) {
					this.$emit('selectedDisabled', this.day)
					return false
				}

				if(!this.day){
          const str = moment(this.value).format('YYYY-MM-DD');
					const now = moment(str).unix();
					this.setDate(moment(now*1000).set({ hour: this.hours, minute: this.minutes }).format())
        }else{
					this.setDate(moment(this.day.timestamp).set({ hour: this.hours, minute: this.minutes }).format())
        }

				if (!this.isInline) {
					this.close(true)
				}
				this.day = ''
			},
			setDay(day) {
				if (!day.isDisabled) {
					this.day = day
				}
			},
			selectMonth(month) {
				if (month.isDisabled) {
					return false
				}

				const date = new Date(month.timestamp)
				if (this.allowedToShowView('day')) {
					this.setPageDate(date)
					this.$emit('changedMonth', month)
					this.showDayCalendar()
				} else {
					this.setDate(date)
					if (!this.isInline) {
						this.close(true)
					}
				}
			},
			selectYear(year) {
				if (year.isDisabled) {
					return false
				}

				const date = new Date(year.timestamp)
				if (this.allowedToShowView('month')) {
					this.setPageDate(date)
					this.$emit('changedYear', year)
					this.showMonthCalendar()
				} else {
					this.setDate(date)
					if (!this.isInline) {
						this.close(true)
					}
				}
			},
			getPageDate() {
				return this.pageDate.getDate()
			},
			getPageMonth() {
				return this.pageDate.getMonth()
			},
			getPageYear() {
				return this.pageDate.getFullYear()
			},
			getPageDecade() {
				const decadeStart = Math.floor(this.pageDate.getFullYear() / 10) * 10
				const decadeEnd = decadeStart + 9
				return `${ decadeStart } - ${ decadeEnd }`
			},
			changeMonth(incrementBy) {
				let date = this.pageDate
				date.setMonth(date.getMonth() + incrementBy)
				this.setPageDate(date)
				this.$emit('changedMonth', date)
			},
			previousMonth() {
				if (!this.previousMonthDisabled()) {
					this.changeMonth(-1)
				}
			},
			previousMonthDisabled() {
				if (!this.disabled || !this.disabled.to) {
					return false
				}
				let d = this.pageDate
				return this.disabled.to.getMonth() >= d.getMonth() &&
						this.disabled.to.getFullYear() >= d.getFullYear()
			},
			nextMonth() {
				if (!this.nextMonthDisabled()) {
					this.changeMonth(+1)
				}
			},
			nextMonthDisabled() {
				if (!this.disabled || !this.disabled.from) {
					return false
				}
				let d = this.pageDate
				return this.disabled.from.getMonth() <= d.getMonth() &&
						this.disabled.from.getFullYear() <= d.getFullYear()
			},
			changeYear(incrementBy, emit = 'changedYear') {
				let date = this.pageDate
				date.setYear(date.getFullYear() + incrementBy)
				this.setPageDate(date)
				this.$emit(emit, date)
			},
			previousYear() {
				if (!this.previousYearDisabled()) {
					this.changeYear(-1)
				}
			},
			previousYearDisabled() {
				if (!this.disabled || !this.disabled.to) {
					return false
				}
				return this.disabled.to.getFullYear() >= this.pageDate.getFullYear()
			},
			nextYear() {
				if (!this.nextYearDisabled()) {
					this.changeYear(1)
				}
			},
			nextYearDisabled() {
				if (!this.disabled || !this.disabled.from) {
					return false
				}
				return this.disabled.from.getFullYear() <= this.pageDate.getFullYear()
			},
			previousDecade() {
				if (!this.previousDecadeDisabled()) {
					this.changeYear(-10, 'changeDecade')
				}
			},
			previousDecadeDisabled() {
				if (!this.disabled || !this.disabled.to) {
					return false
				}
				return Math.floor(this.disabled.to.getFullYear() / 10) * 10 >= Math.floor(this.pageDate.getFullYear() / 10) * 10
			},
			nextDecade() {
				if (!this.nextDecadeDisabled()) {
					this.changeYear(10, 'changeDecade')
				}
			},
			nextDecadeDisabled() {
				if (!this.disabled || !this.disabled.from) {
					return false
				}
				return Math.ceil(this.disabled.from.getFullYear() / 10) * 10 <= Math.ceil(this.pageDate.getFullYear() / 10) * 10
			},
			isSelectedDate(dObj) {
				return this.selectedDate && this.selectedDate.toDateString() === dObj.toDateString()
			},
			isDisabledDate(date) {
				let disabled = false

				if (typeof this.disabled === 'undefined') {
					return false
				}

				if (typeof this.disabled.dates !== 'undefined') {
					this.disabled.dates.forEach((d) => {
						if (date.toDateString() === d.toDateString()) {
							disabled = true
							return true
						}
					})
				}
				if (typeof this.disabled.to !== 'undefined' && this.disabled.to && date < this.disabled.to) {
					disabled = true
				}
				if (typeof this.disabled.from !== 'undefined' && this.disabled.from && date > this.disabled.from) {
					disabled = true
				}
				if (typeof this.disabled.ranges !== 'undefined') {
					this.disabled.ranges.forEach((range) => {
						if (typeof range.from !== 'undefined' && range.from && typeof range.to !== 'undefined' && range.to) {
							if (date < range.to && date > range.from) {
								disabled = true
								return true
							}
						}
					})
				}
				if (typeof this.disabled.days !== 'undefined' && this.disabled.days.indexOf(date.getDay()) !== -1) {
					disabled = true
				}
				if (typeof this.disabled.daysOfMonth !== 'undefined' && this.disabled.daysOfMonth.indexOf(date.getDate()) !== -1) {
					disabled = true
				}
				if (typeof this.disabled.customPredictor === 'function' && this.disabled.customPredictor(date)) {
					disabled = true
				}
				return disabled
			},
			isHighlightedDate(date) {
				if (!(this.highlighted && this.highlighted.includeDisabled) && this.isDisabledDate(date)) {
					return false
				}

				let highlighted = false

				if (typeof this.highlighted === 'undefined') {
					return false
				}

				if (typeof this.highlighted.dates !== 'undefined') {
					this.highlighted.dates.forEach((d) => {
						if (date.toDateString() === d.toDateString()) {
							highlighted = true
							return true
						}
					})
				}

				if (this.isDefined(this.highlighted.from) && this.isDefined(this.highlighted.to)) {
					highlighted = date >= this.highlighted.from && date <= this.highlighted.to
				}

				if (typeof this.highlighted.days !== 'undefined' && this.highlighted.days.indexOf(date.getDay()) !== -1) {
					highlighted = true
				}

				if (typeof this.highlighted.daysOfMonth !== 'undefined' && this.highlighted.daysOfMonth.indexOf(date.getDate()) !== -1) {
					highlighted = true
				}

				if (typeof this.highlighted.customPredictor === 'function' && this.highlighted.customPredictor(date)) {
					highlighted = true
				}

				return highlighted
			},
			isHighlightStart(date) {
				return this.isHighlightedDate(date) &&
						(this.highlighted.from instanceof Date) &&
						(this.highlighted.from.getFullYear() === date.getFullYear()) &&
						(this.highlighted.from.getMonth() === date.getMonth()) &&
						(this.highlighted.from.getDate() === date.getDate())
			},
			isHighlightEnd(date) {
				return this.isHighlightedDate(date) &&
						(this.highlighted.to instanceof Date) &&
						(this.highlighted.to.getFullYear() === date.getFullYear()) &&
						(this.highlighted.to.getMonth() === date.getMonth()) &&
						(this.highlighted.to.getDate() === date.getDate())
			},
			isDefined(prop) {
				return typeof prop !== 'undefined' && prop
			},

			isSelectedMonth(date) {
				return (this.selectedDate &&
						this.selectedDate.getFullYear() === date.getFullYear() &&
						this.selectedDate.getMonth() === date.getMonth())
			},
			isDisabledMonth(date) {
				let disabled = false

				if (typeof this.disabled === 'undefined') {
					return false
				}

				if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
					if (
							(date.getMonth() < this.disabled.to.getMonth() && date.getFullYear() <= this.disabled.to.getFullYear()) ||
							date.getFullYear() < this.disabled.to.getFullYear()
					) {
						disabled = true
					}
				}
				if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
					if (
							this.disabled.from &&
							(date.getMonth() > this.disabled.from.getMonth() && date.getFullYear() >= this.disabled.from.getFullYear()) ||
							date.getFullYear() > this.disabled.from.getFullYear()
					) {
						disabled = true
					}
				}
				return disabled
			},
			isSelectedYear(date) {
				return this.selectedDate && this.selectedDate.getFullYear() === date.getFullYear()
			},
			isDisabledYear(date) {
				let disabled = false
				if (typeof this.disabled === 'undefined' || !this.disabled) {
					return false
				}

				if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
					if (date.getFullYear() < this.disabled.to.getFullYear()) {
						disabled = true
					}
				}
				if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
					if (date.getFullYear() > this.disabled.from.getFullYear()) {
						disabled = true
					}
				}

				return disabled
			},
			setValue(date) {
				if (typeof date === 'string' || typeof date === 'number') {
					let parsed = new Date(date)
					date = isNaN(parsed.valueOf()) ? null : parsed
				}
				if (!date) {
					this.setPageDate()
					this.selectedDate = null
					return
				}
				this.hours = moment(date).hours()
				this.minutes = moment(date).minutes()
				this.selectedDate = date
				// this.setPageDate(date)
			},
			setPageDate(date) {
				if (!date) {
					if (this.openDate) {
						date = new Date(this.openDate)
					} else {
						date = new Date()
					}
				}
				this.pageTimestamp = (new Date(date)).setDate(1)
			},
			clickOutside(event) {
				if (this.$el && !this.$el.contains(event.target)) {
					if (this.isInline) {
						return this.showDayCalendar()
					}
					this.resetDefaultDate()
					this.close(true)
					document.removeEventListener('click', this.clickOutside, false)
				}
				this.$emit('scrollDrop', { drop: this.isOpen, offsetTop: 0, offsetHeight: 0 })
			},
			dayClasses(day) {
				return {
					'selected': day.isToday,
					'disabled': day.isDisabled,
					'highlighted': day.isHighlighted,
					'today': (day.isSelected && !this.day) || day === this.day,
					'beforeToday': day.isBeforeToday,
					'weekend': day.isWeekend,
					'sat': day.isSaturday,
					'sun': day.isSunday,
					'highlight-start': day.isHighlightStart,
					'highlight-end': day.isHighlightEnd,
					'notCurrentMonth': day.isNotCurrentMonth
				}
			},
			init() {
				if (this.value) {
					this.setValue(this.value)
				}
				if (this.isInline) {
					this.setInitialView()
				}
			},
			checkHours(hours) {
				hours = parseInt((hours + '').replace(/[^-\d]/g, ''))
				if (hours >= 24) {
					this.hours = 0
					return
				}
				if (hours < 0) {
					this.hours = 23
					return
				}
				this.hours = hours
			},
			checkMinutes(minutes) {
				minutes = parseInt((minutes + '').replace(/[^-\d]/g, ''))
				if (minutes > 59) {
					this.checkHours((+this.hours + 1))
					this.minutes = 0
					return
				}
				if (minutes < 0) {
					this.checkHours((+this.hours - 1))
					this.minutes = 59
					return
				}
				this.minutes = minutes

			},
			selectAllText(e) {
				e.target.select()
			},
			twoDigit(digit) {
				return digit < 10 ? '0' + digit : digit
			}
		},
		mounted() {
			this.init()
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/colors.scss';


  .fa-backspace {
    font-size: 16px;
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;
    position: absolute;
    right: 8px;
    top: 8px;

    &:hover {
      color: $text;
    }
  }

  .vdp-datepicker__calendar div .cell {
    font-size: 16px;
  }

  .rtl {
    direction: rtl;
  }

  .vdp-datepicker {
    position: relative;
    text-align: left;
  }

  .vdp-datepicker * {
    box-sizing: border-box;
  }

  .vdp-datepicker__calendar {
    position: absolute;
    z-index: 100;
    background: #fff;
    box-shadow: $box-shadow;
    border-radius: 4px;
  }

  .vdp-datepicker__calendar header {
    display: block;
    line-height: 40px;
  }

  .vdp-datepicker__calendar header span {
    display: inline-block;
    text-align: center;
    width: 71.42857142857143%;
    float: left;
  }

  .vdp-datepicker__calendar header .prev,
  .vdp-datepicker__calendar header .next {
    width: 14.285714285714286%;
    float: left;
    text-indent: -10000px;
    position: relative;
  }

  .vdp-datepicker__calendar header .up {
    color: #d66f58;
    font-size: 16px;
    font-family: 'Myriad900';
  }

  .vdp-datepicker__calendar header .prev:after,
  .vdp-datepicker__calendar header .next:after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    border: 6px solid transparent;
  }

  .vdp-datepicker__calendar header .prev:after {
    border-right: 10px solid #d66f58;
    margin-left: -5px;
  }

  .vdp-datepicker__calendar header .prev.disabled:after {
    border-right: 10px solid #ddd;
  }

  .vdp-datepicker__calendar header .next:after {
    border-left: 10px solid #d66f58;
    margin-left: 5px;
  }

  .vdp-datepicker__calendar header .next.disabled:after {
    border-left: 10px solid #ddd;
  }

  .vdp-datepicker__calendar header .prev:not(.disabled),
  .vdp-datepicker__calendar header .next:not(.disabled),
  .vdp-datepicker__calendar header .up:not(.disabled) {
    cursor: pointer;
  }

  .vdp-datepicker__calendar header .prev:not(.disabled):hover,
  .vdp-datepicker__calendar header .next:not(.disabled):hover,
  .vdp-datepicker__calendar header .up:not(.disabled):hover {
    background: $light-border;
  }

  .vdp-datepicker__calendar .disabled {
    color: #ddd;
    cursor: default;
  }

  .vdp-datepicker__calendar .flex-rtl {
    display: flex;
    width: inherit;
    flex-wrap: wrap;
  }

  .vdp-datepicker__calendar .cell {
    display: inline-block;
    padding: 0 5px;
    width: 14.285714285714286%;
    height: 32px;
    line-height: 32px;
    text-align: center;
    vertical-align: middle;
    border: 1px solid transparent;
  }

  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).day,
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).month,
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).year {
    cursor: pointer;
  }

  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).day:hover,
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).month:hover,
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).year:hover {
    border: 1px solid #d66f58;
  }

  .vdp-datepicker__calendar .cell.selected {
    color: #d66f58;
    font-family: 'Myriad600';
  }

  /*.vdp-datepicker__calendar .cell.selected:hover {*/
  /*  font-family: Myriad600;*/
  /*}*/

  /*.vdp-datepicker__calendar .cell.selected.highlighted {*/
  /*  background: #4bd;*/
  /*}*/

  .vdp-datepicker__calendar .cell.highlighted {
    /*background: #daeded;*/
  }

  .vdp-datepicker__calendar .cell.today {
    background-color: #d66f58;
    color: #FFF !important;
    font-family: Myriad600;
  }

  .vdp-datepicker__calendar .cell.beforeToday {
    color: $border;
  }

  .vdp-datepicker__calendar .cell.highlighted.disabled {
    color: #a3a3a3;
  }

  .vdp-datepicker__calendar .cell.grey {
    color: #888;
  }

  .vdp-datepicker__calendar .cell.grey:hover {
    background: inherit;
  }

  .vdp-datepicker__calendar .cell.day-header {
    white-space: no-wrap;
    cursor: inherit;
    background-color: #d66f58;
    cursor: default;
    color: white;
  }

  .vdp-datepicker__calendar .month,
  .vdp-datepicker__calendar .year {
    width: 33.333%;
  }

  .vdp-datepicker__clear-button,
  .vdp-datepicker__calendar-button {
    cursor: pointer;
    font-style: normal;
  }

  .vdp-datepicker__clear-button.disabled,
  .vdp-datepicker__calendar-button.disabled {
    color: #999;
    cursor: default;
  }

  .vdp-datepicker__calendar .cell.notCurrentMonth {
    color: $border;
  }


  /* Custom styles for different components */
  .vendor__calendar-custom {
    width: 260px;
    margin-right: 20px;

    .cell.beforeToday {
      color: #66563d;
    }

    .cell.day {
      color: #66563d;
    }

    .cell.today {
      color: #d66f58 !important;
      background-color: #fff !important;
      font-weight: bold;
    }

    .selected {
      background-color: #d66f58 !important;
      color: #fff !important;
    }
  }

  .datepicker-custom-project-info {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-custom-compliance {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-custom {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-custom-client {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-custom-mod {
    width: 220px;
  }

  .steps__custom-input {
    color: $text;
    border: none;
    width: 100%;
    background-color: transparent;
    cursor: pointer;
    margin: 0;
    outline: 0;
    padding: 0;
  }

  .steps__calendar-custom {
    right: -6px;
    top: 26px;
  }

  .filters .datepicker-custom {
    width: 166px;
    height: 30px;
  }

  .filters .datepicker-custom-filter {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-custom-filter {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;
    cursor: pointer;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-custom-filter-185 {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 185px;
    height: 32px;
    transition: .1s ease-out;
    cursor: pointer;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .datepicker-height-30 {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .calendar-custom {
    width: 260px;
    right: 0;
    box-shadow: $box-shadow;
  }

  .calendar-custom .cell,
  .steps__calendar-custom .cell {
    /*height: 26px;*/
    /*line-height: 26px;*/
  }

  .cell.day-header {
    height: 28px;
    line-height: 28px;
  }

  .custom-fonts .cell.day,
  .steps__calendar-custom .cell.day {
    font-size: 14px;
  }

  .custom-fonts .cell.day-header,
  .steps__calendar-custom .cell.day-header {
    font-size: 12px;
  }

  .request_background {
    background-color: rgba(229, 105, 97, 0.24);
  }

  .time-select {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  .time-select i {
    color: #d66f58;
  }

  .time-select span {
    width: 100%;
    text-align: center;
    cursor: pointer;
    padding: 5px;
    background: #eee;
    transition: 0.1s ease-in;
  }

  .time-select span:hover {
    background: #ddd;
  }

  .time__name {
    margin-right: 5px;
  }

  .change-time {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .date-input {
    width: 129px;
    text-align: center;
    padding: 5px;
    outline: none;
    border: none;
  }

  .separator {
    font-size: 22px;
    height: 30px;
    position: absolute;
  }

  .select-date {
    margin: 20px 10px;
    text-align: center;
  }

  .action-button {
    margin-top: 10px;
  }

  ::-webkit-input-placeholder {
    opacity: 0.45;
  }

  .prev,
  .next {
    font-size: 12px;
  }

</style>
