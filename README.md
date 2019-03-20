# auto-merge-bot

> ラベルが貼られたPRを自動レビュー&マージするBotです。

# 使用例
masterブランチを保護してるけどDependabot等は自動マージしたい...！という時とかに使用できます。

# 使い方

#### Botをインストール
https://github.com/apps/auto-merge-bot から、Botをインストールしてください。後述のconfigファイルが存在しないと動作しないため、ユーザ全体にインストールしてしまっても構いません。

#### リポジトリにconfigを追加
`.github/auto-merge-bot.config.yml` に、次の項目を記入してデフォルトブランチに入れてください。
```yaml
labels:
  - auto_merge_force
  - [auto_merge, minor]

# マージするPRにつけるラベルの条件
# 上記の例では、 auto_merge_force OR ( auto_merge AND minor ) の条件に一致したらマージを行います。

merge_type: squash # マージモード (optional): merge, squash, rebase デフォルト: merge
delete_branch: delete # マージ後にブランチを削除するかどうか (optional): delete または 空欄
```

## License

[Apache-2.0](LICENSE) © 2019 nzws <github@nzws.me> (https://github.com/yuzulabo/auto-merge-bot)
