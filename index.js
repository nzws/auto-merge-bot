const getConfig = require('probot-config');
const cooltime = {};
const alerted = [];

module.exports = app => {
  app.on(
    [
      'pull_request.labeled',
      'pull_request.ready_for_review',
      'pull_request.synchronize',
      'pull_request.reopened'
    ],
    async context => {
      if (
        context.payload.pull_request.draft ||
        context.payload.pull_request.merged
      )
        return;

      const repo = context.repo();
      const name =
        repo.owner +
        '/' +
        repo.repo +
        '#' +
        context.payload.pull_request.number;

      const timeStamp = Math.floor(new Date().getTime() / 1000);
      if (cooltime[name] && timeStamp - cooltime[name] < 5) {
        cooltime[name] = timeStamp;
        app.log('[COOL TIME]', name);
        return;
      }
      cooltime[name] = timeStamp;

      // check all labels
      const labels = context.payload.pull_request.labels.map(
        label => label.name
      );

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

      if (context.payload.pull_request.mergeable === false) {
        if (alerted.indexOf(name) === -1) {
          alerted.push(name);
          const commentData = context.repo({
            pull_number: context.payload.pull_request.number,
            body:
              "This pull request is subject to auto-merge, but is not mergeable. I'll execute it when it is ready to merge.",
            event: 'COMMENT'
          });
          return await context.github.pulls.createReview(commentData);
        }

        return;
      }

      // Approve the pull request
      const reviewData = context.repo({
        pull_number: context.payload.pull_request.number,
        body: '*This review was created by auto-merge bot.*',
        event: 'APPROVE'
      });
      await context.github.pulls.createReview(reviewData);

      try {
        // Merge it
        await context.github.pulls.merge(
          context.repo({
            pull_number: context.payload.pull_request.number,
            merge_method: config.merge_type || 'merge'
          })
        );
      } catch (e) {
        app.log(e);

        if (alerted.indexOf(name) === -1) {
          alerted.push(name);
          const commentData = context.repo({
            pull_number: context.payload.pull_request.number,
            body:
              "Failed to merge this pull request. It's not be mergeable or there is something wrong. I'll merge when it becomes possible to merge.",
            event: 'COMMENT'
          });
          return await context.github.pulls.createReview(commentData);
        }
        return;
      }

      // Delete the branch
      if (!config.delete_branch || config.delete_branch !== 'delete') return;

      return await context.github.git.deleteRef(
        context.repo({
          ref: 'heads/' + context.payload.pull_request.head.ref
        })
      );
    }
  );
};
