# Job Hunter

该项目基于`node.js`，目前只写了[智联招聘](http://www.zhaopin.com)跟[前程无忧](http://www.51job.com)的页面请求分析器。定时在对目标招聘页面的信息进行解析，分析出自己想要的职位信息，将最新的符合条件的职位信息以及对应链接等信息通过邮件的方式发送给查收方。

依赖的库：

- [axios](https://github.com/mzabriskie/axios): 发送请求

- [nodemailer](https://github.com/nodemailer/nodemailer): 发送邮件

## 开启脚本之前

脚本的基础信息设置在模块[`config.js`](./config.js)里边。

首先，我们需要导入已经写好的页面分析器（像zlParser）。

```js
const zlParser = require('./parsers/zhilian-parser.js');
```

设置字段意义：

- form: 接收邮件上的发送人信息（如：`"classlfz", xxxx@gmail.com`）

- to: 接收人列表,两个接收邮件之间用英文逗号隔开

- subject: 邮件主题，会出现在邮件的标题位置

- text: 邮件的文本内容，基本上没啥用，不用管

- admin: 脚本运行日志的接收者邮件地址，两个邮件地址之间用英文逗号隔开

- titles: 标题对象，用于存放对应的邮件信息标题，与下边的`parsers`字段信息对应

- parsers: 页面信息解析器对象，存放两个字段：

  - parser: 分析器实例对象

  - maxPageNum: 最大页面数量

- interval: 定时时间，单位为毫秒，默认值为`3600000`(即一个小时)

- keyWords: 分析关键词

- email_service: 发送邮件的服务器

- email_user: 发送邮件的邮件地址

- email_pass: 发送邮件的邮件地址登录密码

## 开启脚本

如果你已经按照上边的引导对设置文件进行了正确的设置，那么就可以运行：

```sh
$ node index.js

# 或者

$ npm run start
```

**如果你运行了脚本出现报错或查询页面之后没有得到对应的信息，很有可能的一个原因是页面分析器过时的问题。**

## 编写页面解析器

> 由于没有做好编码预处理的原因，抓取的网页最好是编码格式为`UTF8`的，如果是`GBK`或者`gb2312`什么的，解析器那里是会得到一串乱码的html字符串。当然，如果你能解决这个问题，欢迎给我提issues。

自己动手编写页面分析器的好处是，可以抓取自己喜爱的招聘网站。或者，面对招聘网站的页面更新做出调整，以保证脚本的正常运行。详细的构造可以直接到[`parsers`](./parsers)里的`*-parser.js`查看代码。下边只是简单的讲一下，分析器具有那些内容及其返回的数据结构。

页面分析器的主要构造：

- buildRequests函数：用于构建请求promise数组

- parser函数： 分析器最主要的函数，用来解析请求返回的页面，得出招聘信息数组信息（这个数组里边的每一个单个招聘信息为一个对象）。每一个单个的招聘信息对象包含着一下的基本信息：

  - companyName: 公司名称

  - companyLink: 公司招聘信息连接

  - jobName: 招聘职位名称/描述

  - money: 薪酬范围

  - location: 工作地点

  - type: 公司性质(民营/国企/外企？)

  - scale: 公司规模

  - education: 学历要求

  - date: 招聘信息发布时间

如果分析出错最好返回一个空对象，`hunter`模块里边做好了对空对象的处理。

**做你喜欢的事情，喜欢你做的事情。**