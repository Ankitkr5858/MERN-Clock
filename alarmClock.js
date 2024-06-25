const readline = require('readline');
const { EventEmitter } = require('events');

class Alarm {
  constructor(time, days) {
    this.time = time;
    this.days = days;
    this.snoozeCount = 0;
    this.active = true;
  }

  snooze() {
    if (this.snoozeCount < 3) {
      this.time.setMinutes(this.time.getMinutes() + 5);
      this.snoozeCount++;
    } else {
      console.log('Maximum snooze limit reached.');
    }
  }

  resetSnooze() {
    this.snoozeCount = 0;
  }

  isDue(now) {
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return (
      this.active &&
      this.days.includes(day) &&
      this.time.getHours() === hour &&
      this.time.getMinutes() === minute
    );
  }
}

class AlarmClock extends EventEmitter {
  constructor() {
    super();
    this.alarms = [];
    this.startClock();
  }

  startClock() {
    setInterval(() => {
      const now = new Date();
      this.alarms.forEach((alarm) => {
        if (alarm.isDue(now)) {
          this.emit('alarm', alarm);
        }
      });
    }, 60000); // Check every minute
  }

  displayTime() {
    console.log(new Date().toLocaleTimeString());
  }

  addAlarm(time, days) {
    const alarm = new Alarm(time, days);
    this.alarms.push(alarm);
    console.log('Alarm added:', alarm);
  }

  deleteAlarm(index) {
    if (index >= 0 && index < this.alarms.length) {
      this.alarms.splice(index, 1);
      console.log('Alarm deleted.');
    } else {
      console.log('Invalid alarm index.');
    }
  }

  snoozeAlarm(alarm) {
    alarm.snooze();
    console.log('Alarm snoozed to', alarm.time.toLocaleTimeString());
  }

  listAlarms() {
    this.alarms.forEach((alarm, index) => {
      console.log(
        `${index}: ${alarm.time.toLocaleTimeString()} on days ${alarm.days.join(
          ', '
        )}`
      );
    });
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const alarmClock = new AlarmClock();

alarmClock.on('alarm', (alarm) => {
  console.log("ALARM! It's", alarm.time.toLocaleTimeString());
  rl.question(
    'Press "s" to snooze or any other key to stop the alarm: ',
    (answer) => {
      if (answer.toLowerCase() === 's') {
        alarmClock.snoozeAlarm(alarm);
      } else {
        alarm.active = false;
        console.log('Alarm stopped.');
      }
    }
  );
});

const showMenu = () => {
  console.log(`
1. Display Current Time
2. Add Alarm
3. Delete Alarm
4. List Alarms
5. Exit
`);
  rl.question('Choose an option: ', (answer) => {
    switch (answer) {
      case '1':
        alarmClock.displayTime();
        break;
      case '2':
        rl.question('Enter time (HH:MM): ', (time) => {
          rl.question(
            'Enter days (comma separated, 0=Sunday, 6=Saturday): ',
            (days) => {
              const [hour, minute] = time.split(':').map(Number);
              const alarmTime = new Date();
              alarmTime.setHours(hour, minute, 0, 0);
              const alarmDays = days.split(',').map(Number);
              alarmClock.addAlarm(alarmTime, alarmDays);
            }
          );
        });
        break;
      case '3':
        rl.question('Enter alarm index to delete: ', (index) => {
          alarmClock.deleteAlarm(Number(index));
        });
        break;
      case '4':
        alarmClock.listAlarms();
        break;
      case '5':
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option.');
    }
    setTimeout(showMenu, 1000);
  });
};

showMenu();
