# Gitlab component template

<!--
Update this readme with your component details. Replace content in `< >` with your project information.
For more information:

- How to create a CI/CD component: https://docs.gitlab.com/ee/ci/components/#write-a-component
- How to write a clear README.md file: https://docs.gitlab.com/ee/ci/components/#write-a-clear-readmemd
- CI/CD Component security best practices: https://docs.gitlab.com/ee/ci/components/#cicd-component-security-best-practices
-->

<!-- Uncomment and update the following link to display a release badge: https://docs.gitlab.com/ee/user/project/badges.html#latest-release-badges -->
<!-- [![Latest Release](https://gitlab.com/<your project path>/-/badges/release.svg)](https://gitlab.com/<your project path>/-/releases) -->

## Components

### `<Component-name>`

Use this component to `<component-description>`.

To add this component to your CI/CD pipeline, add the following include entry to your
project's CI/CD configuration:

```yaml
include:
  - component: https://gitlab.com/<your project path>/<name of your template>@<tag>
```

Where `<tag>` is the release tag you want to use ([releases list](https://gitlab.com/<your-project-path>/-/releases)).

## Inputs

The template contains some optional [inputs](https://docs.gitlab.com/ee/ci/yaml/inputs.html):

<!-- Add or update rows if you change the inputs in the template -->

| Input      | Default value    | Description |
|------------|------------------|-------------|
| `job_name` | `job-template`   | The job name. |
| `image`    | `busybox:latest` | The container image to use to run the job. |
| `stage`    | `test`           | The stage name for the job. |

## Documentation

This project includes a MVC structure to help you get started with [Gitlab CI/CD components](https://docs.gitlab.com/ee/ci/components/).
The template provides the basic file structure to create your own single component.
This project should be public, or one of the jobs in the project's pipeline won't work.

## Licence

The licence can be changed. By default this project has the [MIT Licence](./LICENCE).
<!-- You should update the year and name in the license file. -->
