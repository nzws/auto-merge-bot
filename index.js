const getConfig = require('probot-config');
const cooltime = {};

module.exports = app => {
  app.on('pull_request.labeled', async context => {
    if (
      context.payload.pull_request.draft ||
      context.payload.pull_request.merged
    )
      return;

    const repo = context.repo();
    const name =
      repo.owner + '/' + repo.repo + '#' + context.payload.pull_request.number;

    const timeStamp = Math.floor(new Date().getTime() / 1000);
    if (cooltime[name] && timeStamp - cooltime[name] < 5) {
      cooltime[name] = timeStamp;
      app.log('[COOL TIME]', name);
      return;
    }
    cooltime[name] = timeStamp;

    // check all labels
    const labels = [];
    context.payload.pull_request.labels.forEach(label => {
      labels.push(label.name);
    });

    // find the config
    const config = await getConfig(context, 'auto-merge-bot.config.yml');
    if (!config) {
      app.log('[CONFIG IS NOT FOUND]', name);
      return;
    }
    app.log(config.delete_branch === 'delete');
    let isExist = false;
    config.labels.forEach(label => {
      if (Array.isArray(label)) {
        const result = label.every(value => {
          return labels.indexOf(value) !== -1;
        });
        if (result) isExist = true;
      } else {
        if (labels.indexOf(label) !== -1) isExist = true;
      }
    });
    if (!isExist) return;

    // Approve the pull request
    const reviewData = context.repo({
      number: context.payload.pull_request.number,
      body: '*This review was created by auto-merge bot.*',
      event: 'APPROVE'
    });
    await context.github.pullRequests.createReview(reviewData);

    // Merge it
    await context.github.pullRequests.merge(
      context.repo({
        number: context.payload.pull_request.number,
        merge_method: config.merge_type ? config.merge_type : 'merge'
      })
    );

    // Delete the branch
    if (!config.delete_branch || config.delete_branch !== 'delete') return;

    return await context.github.gitdata.deleteRef(
      context.repo({
        ref: 'heads/' + context.payload.pull_request.head.ref
      })
    );
  });
};
