// utils/adminUtils.js

import { Day } from "../models/dayModel.js";

export const createDays = async (
  group,
  dayIntervals,
  startingDateWithTime,
  daysLeft,
  dayOff,
  times,
  syllabus
) => {
  let currentDate = new Date(startingDateWithTime);
  let index = 0;
  console.log(syllabus);
  while (daysLeft > 0) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = times[index % times.length];

    if (!dayOff.includes(formattedDate)) {
      const formattedDateTime = `${formattedDate} ${formattedTime}`;
      const newDay = new Day({
        date: formattedDateTime,
        dayStatus: "future",
        group: group._id,
        index: index + 1,
        dayTheme: syllabus[syllabus.length - daysLeft], //რაღაც პრობლემაა
      });
      await newDay.save();
      group.days.push(newDay._id);
      daysLeft--;
    }

    const dayInterval = dayIntervals[index % dayIntervals.length];

    currentDate.setDate(currentDate.getDate() + dayInterval);

    index++;
  }
};
