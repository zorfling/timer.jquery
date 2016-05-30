/* global $:true */
import Constants from './constants';
import utils from './utils';

/**
 * Timer class to be instantiated on every element.
 * All relative values will be stored at instance level.
 */
class Timer {
	/**
	 * Construct a Timer instance on the provided element with the given config.
	 * @param  {Object} element HTML node as passed by jQuery
	 * @param  {Object|String} config User extended options or a string (start, pause, resume etc)
	 */
	constructor(element, config) {
		this.element = element;
		this.totalSeconds = 0;
		this.intervalId = null;
		// A HTML element will have the html() method in jQuery to inject content,
		this.html = 'html';
		if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
			// In case of input element or a textarea, jQuery provides the val() method to inject content
			this.html = 'val';
		}

		this.config = utils.getDefaultConfig();

		if (!config || typeof config === 'string') {
			return;
		}

		if (config.duration) {
			config.duration = utils.durationTimeToSeconds(config.duration);
		}
		this.config = Object.assign(this.config, config);
		if (this.config.seconds) {
			this.totalSeconds = this.config.seconds;
		}

		if (this.config.editable) {
			utils.makeEditable(this);
		}
	}

	start() {
		if (this.state !== Constants.TIMER_RUNNING) {
			this.startTime = utils.unixSeconds() - this.totalSeconds;
			utils.setState(this, Constants.TIMER_RUNNING);
			this.render();
			this.intervalId = setInterval(utils.intervalHandler.bind(null, this), this.config.updateFrequency);
		}
	}

	pause() {
		if (this.state === Constants.TIMER_RUNNING) {
			utils.setState(this, Constants.TIMER_PAUSED);
			clearInterval(this.intervalId);
		}
	}

	resume() {
		if (this.state === Constants.TIMER_PAUSED) {
			utils.setState(this, Constants.TIMER_RUNNING);
			this.startTime = utils.unixSeconds() - this.totalSeconds;
			this.intervalId = setInterval(utils.intervalHandler.bind(null, this), this.config.updateFrequency);
		}
	}

	remove() {
		clearInterval(this.intervalId);
		$(this.element).data(Constants.PLUGIN_NAME, null);
	}

	render() {
		if (this.config.format) {
			$(this.element)[this.html](utils.secondsToFormattedTime(this.totalSeconds, this.config.format));
		} else {
			$(this.element)[this.html](utils.secondsToPrettyTime(this.totalSeconds));
		}
		// Make total seconds available via timer element's data attribute
		$(this.element).data('seconds', this.totalSeconds);
	}
}

export default Timer;
