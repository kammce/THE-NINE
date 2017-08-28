#include <stdint.h>
#include "LPC17xx.h"
#include "lpc_isr.h"
#include "Servo.hpp"

// ==============================
// Servo Driver
// ==============================
bool Servo::switch_flag = false;
uint32_t Servo::timer_count = 0;

/*
Microservo SG90
Max 	 90 deg = 2440
Center 	 0  deg	= 1360;
Min 	-90 deg = 540
*/

uint32_t Servo::pulse_time = 1500;
uint32_t Servo::tmp_pulse_time = Servo::pulse_time;
uint32_t Servo::gpio = 0;

Servo::Servo(uint32_t set_gpio)
{
	gpio = set_gpio;
	timer_count = 0;
	switch_flag = false;
}

bool Servo::initialize()
{

	LPC_SC->PCONP |= (1 << 16);
	LPC_SC->PCLKSEL1 |= (0b11 << 26);
	LPC_RIT->RICOUNTER = 0;
	LPC_RIT->RICOMPVAL = 120;
	LPC_RIT->RICTRL |= (1 << 1);
	LPC_RIT->RICTRL |= (1 << 3);

    NVIC_SetPriority(RIT_IRQn, 1);
    NVIC_EnableIRQ(RIT_IRQn);

	LPC_GPIO2->FIODIR |= (1 << gpio);
	LPC_GPIO2->FIOCLR |= (1 << gpio);

	isr_register(RIT_IRQn, interruptHandler);
	return true;
}

uint32_t Servo::setPulse(uint32_t new_pulse)
{
	if(new_pulse > MAX_PERIOD)
	{
		tmp_pulse_time = MAX_PERIOD;
	}
	else if(new_pulse < MIN_PERIOD+PULSE_OVERSHOOT_PERIOD)
	{
		tmp_pulse_time = MIN_PERIOD+PULSE_OVERSHOOT_PERIOD;
	}
	else
	{
		tmp_pulse_time = new_pulse;
	}
	return tmp_pulse_time;
}

uint32_t Servo::getTimer()
{
	return timer_count;
}

uint32_t Servo::getPulse()
{
	return pulse_time;
}

void Servo::interruptHandler()
{
	//// Clear RIT Interrupt flag
	LPC_RIT->RICTRL |= 0b1;

	timer_count += 20;
	if(timer_count >= MAX_PERIOD)
	{
		timer_count = 0;
		pulse_time = tmp_pulse_time-PULSE_OVERSHOOT_PERIOD;
		LPC_GPIO2->FIOSET |= (1 << gpio);
	}
	else if(timer_count >= pulse_time)
	{
		LPC_GPIO2->FIOCLR |= (1 << gpio);
	}
}