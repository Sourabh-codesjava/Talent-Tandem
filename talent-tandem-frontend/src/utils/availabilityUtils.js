// Utility to calculate next 6 available time slots based on mentor availability
export const calculateNextSlots = (mentorAvailability, count = 6) => {
  if (!mentorAvailability) return [];

  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayMap = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
  };

  // Handle single availability object (OneToOne) or array (OneToMany)
  const availabilities = Array.isArray(mentorAvailability) ? mentorAvailability : [mentorAvailability];
  
  // Group availability by day
  const availabilityByDay = {};
  availabilities.forEach(avail => {
    const day = avail.dayOfWeek;
    if (!availabilityByDay[day]) availabilityByDay[day] = [];
    availabilityByDay[day].push({
      startTime: avail.startTime,
      endTime: avail.endTime
    });
  });

  // Find next occurrences
  let daysChecked = 0;
  const maxDaysToCheck = 60; // Check up to 60 days ahead

  while (slots.length < count && daysChecked < maxDaysToCheck) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + daysChecked);
    const dayOfWeek = checkDate.getDay();
    
    // Find day name from dayOfWeek number
    const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
    
    if (availabilityByDay[dayName]) {
      availabilityByDay[dayName].forEach(timeSlot => {
        if (slots.length < count) {
          const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
          const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);
          
          const slotDateTime = new Date(checkDate);
          slotDateTime.setHours(startHour, startMinute, 0, 0);
          
          // Only add future slots
          if (slotDateTime > new Date()) {
            slots.push({
              dateTime: slotDateTime.toISOString(),
              dayOfWeek: dayName,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
              displayLabel: `${slotDateTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} - ${timeSlot.startTime} to ${timeSlot.endTime}`
            });
          }
        }
      });
    }
    
    daysChecked++;
  }

  return slots;
};
