import Concurrently from './concurrently';

const concur = new Concurrently(3);

const waitFor = (time: number) =>
  new Promise((resolve) => {
    return setTimeout(resolve, time);
  });

const lightTask = () => waitFor(5000);

const heavyTask = () => waitFor(100000);

[heavyTask, heavyTask]
  .concat([...new Array(1000)].map(() => lightTask))
  .map((task, i) =>
    concur.task(async () => {
      console.log('executing', i);
      await task();
      console.log('done', i);
    }),
  );
