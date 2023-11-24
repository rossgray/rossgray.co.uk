---
title: How to create a custom Kubernetes scheduler
date: 2023-11-24
tags: ["how-to", "Kubernetes", "minikube", "go", "golang"]
---

This post explains how to customise the logic inside the Kubernetes scheduler, the component responsible for determining how pods get allocated to nodes.

While there are several resources in the Kubernetes documentation regarding how the scheduler works and how it can be extended, I couldn't find many examples or tutorials on how you would actually go about it in practice.

At first, it appeared as though you can just write your own [custom scheduler][configure multiple schedulers], but then I discovered there was a better way, using the [Scheduling Framework][scheduling framework]. As mentioned in the docs:
> The scheduling framework is a pluggable architecture for the Kubernetes scheduler. The APIs allow most scheduling features to be implemented as plugins, while keeping the scheduling "core" lightweight and maintainable.

This means we can just write a custom plugin for the specific point of the scheduling cycle we're interested in. This is a lot more straightforward than rewriting the whole scheduler, which is a very complex system and would require a lot of maintenance to ensure it works with each update to Kubernetes.

{% infoBox %}
If you want to go straight to the code, you can check out the repo I created [here](https://github.com/rossgray/custom-k8s-scheduler)
{% endinfoBox %}

## Creating a proof-of-concept

The aim here was just to create a proof-of-concept; to create and deploy a scheduler plugin that customised the scheduling logic in some way. 

The custom logic itself was not particularly important; since it is a Go function you can more or less do anything you want to inside of it. Therefore, as you'll probably notice, it would not make sense to use the plugin I created in reality; the same behaviour can easily be achieved using built-in functionality, such as [using a `nodeSelector` in your deployment][assign pods to nodes]. However, if we wanted more control over how our pods get scheduled, for example, based on some internal state of our nodes, it would be reasonably straightforward to modify this plugin to add the desired behaviour.

When I was searching online, in addition to the Kubernetes documentation, I found this very useful [repo][crl-scheduler] written by Chris Seto at Cockroach Labs, which, although slightly out-of-date, was very useful as a reference.

### Writing a custom scheduler plugin

The actual amount of code required to create a scheduler plugin is very minimal.

Firstly, you need to create a plugin that implements the interface corresponding to the [scheduling extension point][scheduling framework interfaces] you're interested in. For example, the [`FilterPlugin` interface][FilterPlugin interface] just requires you to implement a `Name` and a `Filter` function, both of which are reasonably straightforward.

Secondly, you simply need instantiate a new scheduler, passing your custom plugin into it, and then start it. For example:

```go
func main() {
	command := scheduler.NewSchedulerCommand(
		scheduler.WithPlugin(plugin.Name, plugin.New),
	)
	if err := command.Execute(); err != nil {
		klog.Fatal(err)
	}
}
```

You can see the full code for my sample scheduler plugin [here][my custom k8s scheduler].


Although the amount of code I needed to write was very small, being neither an expert in Kubernetes or Go, I ran into a couple of issues along the way...

#### Importing Kubernetes packages

One of the first issues I ran into was importing types from within the `k8s.io/kubernetes` module. When running `go mod tidy` I would run into errors such as:

```shell
go: k8s.io/cloud-provider@v0.0.0: reading k8s.io/cloud-provider/go.mod at revision v0.0.0: unknown revision v0.0.0
```

After a bit of searching online I found the following [GitHub issue], particularly [this comment][GitHub issue comment] which explains that:

> ... use of packages within the k8s.io/kubernetes module as a library/dependency is unsupported and not recommended. The modules intended to be consumed as libraries are published with go.mod files that do not require any replace directives.

One way around this I suspect would be to clone the entire Kubernetes repo and import the packages directly. However, I then found [another comment][fixing Go dependencies] referencing a script that can be used to pin the versions of all modules for a given Kubernetes version.
This worked perfectly; I copied this script into a [file][fix dependencies script], then ran `bash fix-deps.sh 1.27.3` (with 1.27.3 being the Kubernetes version I was targeting).

#### Deployment

One other problem that wasn't immediately clear to me was how to deploy my custom scheduler plugin. In the end I found an example configuration [here][multiple schedulers deployment] which I modified slightly to produce the [final configuration][scheduler config] for my demo.

## Minikube demo

I wanted to ensure the custom scheduler I had created would actually work in practice. To test it out, I created a multi-node Kubernetes cluster on my local machine using [minikube]. The idea was to create a couple of sample apps, each with a separate deployment and try to get all pods from one app scheduled on one node and all pods from the other app scheduled on the other node.

For more info on running the demo, refer to the [README][demo readme] in the repo.

## Useful resources

- [This repo][crl-scheduler] for a custom scheduler written by Chris Seto at Cockroach Labs was very useful as a reference
- The [Kubernetes Scheduling Framework][scheduling framework]
- Source code for other ['official' scheduler plugins][scheduler plugins]
- Source code for [my custom scheduler][my custom k8s scheduler]

[assign pods to nodes]: https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes/
[scheduling framework]: https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/
[scheduling framework interfaces]: https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/#interfaces
[configure multiple schedulers]: https://kubernetes.io/docs/tasks/extend-kubernetes/configure-multiple-schedulers/
[multiple schedulers deployment]: https://kubernetes.io/docs/tasks/extend-kubernetes/configure-multiple-schedulers/#define-a-kubernetes-deployment-for-the-scheduler
[crl-scheduler]: https://github.com/cockroachlabs/crl-scheduler/tree/master
[scheduler plugins]: https://github.com/kubernetes-sigs/scheduler-plugins
[my custom k8s scheduler]: https://github.com/rossgray/custom-k8s-scheduler
[FilterPlugin interface]: https://pkg.go.dev/k8s.io/kubernetes@v1.27.3/pkg/scheduler/framework#FilterPlugin
[GitHub issue]: https://github.com/kubernetes/kubernetes/issues/79384
[GitHub issue comment]: https://github.com/kubernetes/kubernetes/issues/79384#issuecomment-505627280
[fix dependencies script]: https://github.com/rossgray/custom-k8s-scheduler/blob/main/fix-deps.sh
[fixing Go dependencies]: https://github.com/kubernetes/kubernetes/issues/79384#issuecomment-521493597
[scheduler config]: https://github.com/rossgray/custom-k8s-scheduler/blob/main/deploy/custom-scheduler.yaml
[minikube]: https://minikube.sigs.k8s.io/docs/
[demo readme]: https://github.com/rossgray/custom-k8s-scheduler/blob/main/demo/README.md