<template lang="pug">
    .copywritingWrapper
        .copywritingContainer
            form.copywriting-form
                .col-1
                    .col-1__block1
                        span.block1 1. Type
                        span.star *
                    .col-1__block2
                        .col-1__block2-sub1
                            span.sub1 Article
                            img(src="../../assets/images/article-icon-selected.png")
                        .col-1__block2-sub2
                            span.sub2 Blog Post
                            img(src="../../assets/images/blog-icon.png")
                        .col-1__block2-sub3
                            span.sub2 Review
                            img(src="../../assets/images/reviews-icon.png")
                .col-2
                    .col-2__block1
                        span.block1 2. Select a Language
                    .col-2__block2
                        span.block2 Language(s)
                    .col-2__block3
                        span.sub1 Select
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col-3
                    .col-3__block1
                        span.block1 3. Package
                        span.star *
                    .col-3__block2
                        .col-3__block2-sub1
                            .choice
                            span.sub1 Up to 199
                            img(src="../../assets/images/UP-TO-199-icon.png")
                        .col-3__block2-sub2
                            .choice
                            span.sub1 200 - 399
                            img(src="../../assets/images/200-399-icon.png")
                        .col-3__block2-sub3
                            .choice
                            span.sub1 400 - 599
                            img(src="../../assets/images/400-599-icon.png")
                        .col-3__block2-sub4
                            .choice
                            span.sub1 600 - 999
                            img(src="../../assets/images/600-999-icon.png")
                        .col-3__block2-sub5
                            .choice
                            span.sub1 1000 - 1400
                            img(src="../../assets/images/1000-1400-icon.png")

                .col-4
                    .col-4__block1
                        span.block1 4. General Brief
                    .col-4__block2
                        .descr
                            .head
                                span.block2 Description
                                span.star *
                                span.notice Please give a brief description of the project in as match detail as possible.
                        .inner-ta
                            textarea.ta-block2
                    .col-4__block3
                        .descr-1
                            .head-1
                                span.block3 Targeted Audience
                                span.notice-1 What kind of audience will read this article?
                        .in-block3
                            input
                    .col-4__block4
                        span.block4 Suggested title
                        .in-block4
                            input
                    .col-4__block5
                        .descr-2
                            .head-2
                                span.block5 Topics to mention or not mention
                                span.notice-2 What main topics should or should not be discussed in the article? Please be as detailed as possible.
                                span.star *
                        .wrap
                            .in-block5
                                textarea
                            .block5-delim
                                span.delim or
                            .block5-but
                                button I am not sure
                    .col-4__block6 6
                    .col-4__block7 7
                .col-5
                    .col-5__block1
                        span.block1 5. Structure to Include
                .col-6
                    .col-6__block1
                        span.block1 6. Style *
                .col-7
                    .col-7__block1
                        span.block1 7. Tone of voice *
                .col-8
                    .col-8__block1
                        span.block1 8. Design
                .col-9
                    .col-9__block1
                        span.block1 9. SEO
        .orderInfo()
          .orderInfo__title
            h3 YOUR ORDER
          .orderInfo__summary
            .orderInfo__summary-service
              span 1
              label SERVICE: 
              p.choice
            .orderInfo__summary-languages
              span 2
              label LANGUAGE:
              p W
                span.choice &nbsp;
              p Target: 
                span.choice &nbsp;
            .orderInfo__summary-industry
              span 3
              label INDUSTRY: 
              p.choice
            .orderInfo__summary-deadline
              label SUGGESTED DEADLINE
              p.choice
</template>

<script>
export default {
    data() {
        return {
            
        };
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/clientrequest/copywriting.scss"
</style>
