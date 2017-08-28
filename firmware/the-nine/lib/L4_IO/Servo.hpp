#include "LPC17xx.h"
#include <stdint.h>

#ifndef SERVO_H
#define SERVO_H

// ==============================
// Servo Driver
// ==============================

class Servo
{
private:
public:
	static const uint32_t MAX_PERIOD = 20000;
	static const uint32_t CENTER = 1500;
	static bool switch_flag;
	static uint32_t timer_count;
	static uint32_t pulse_time;
	static uint32_t gpio;
	static const uint32_t PULSE_OVERSHOOT_PERIOD = 20;
	static const uint32_t MIN_PERIOD = 500;
	static uint32_t tmp_pulse_time;

	Servo(uint32_t set_gpio);
	bool initialize();
	uint32_t getTimer();
	uint32_t getPulse();
	inline static bool ifTimerInterrupt();
	inline static void setServoPin(bool high);
	inline static void clearInterrupt();
	uint32_t setPulse(uint32_t n_useconds);
	static void interruptHandler();
	void resetInterrupt();
};

#endif